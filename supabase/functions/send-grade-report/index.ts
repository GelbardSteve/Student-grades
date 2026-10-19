// Emails a student all of their grades in one class.
//
// Authorization: the database is queried with the caller's own JWT, so Row Level Security decides
// what this function can see. Another admin's student simply isn't found. No service-role key is used.
// Secrets (email provider key) live only in the function's environment, never in the browser.
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_EMAILS_PER_HOUR = Number(Deno.env.get('MAX_EMAILS_PER_HOUR') ?? 30);

// Comma-separated list of the app's origins, e.g. "https://grades.example.com,http://localhost:3000"
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:3000').split(',').map((o) => o.trim());

const corsHeadersFor = (req: Request) => {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
};

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type Grade = { subject: string; score: number; comment: string | null };

const buildEmail = (studentName: string, className: string, grades: Grade[]) => {
  const rows = grades
    .map(
      (g) =>
        `<tr><td style="padding:6px 12px;border:1px solid #ddd">${escapeHtml(g.subject)}</td>` +
        `<td style="padding:6px 12px;border:1px solid #ddd;text-align:right">${escapeHtml(Number(g.score))}</td>` +
        `<td style="padding:6px 12px;border:1px solid #ddd">${escapeHtml(g.comment)}</td></tr>`
    )
    .join('');
  const html =
    `<p>Hello ${escapeHtml(studentName)},</p>` +
    `<p>Here are your grades for <strong>${escapeHtml(className)}</strong>:</p>` +
    `<table style="border-collapse:collapse"><thead><tr>` +
    `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Subject</th>` +
    `<th style="padding:6px 12px;border:1px solid #ddd">Score</th>` +
    `<th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Comment</th>` +
    `</tr></thead><tbody>${rows}</tbody></table>`;
  const text =
    `Hello ${studentName},\n\nHere are your grades for ${className}:\n\n` +
    grades.map((g) => `${g.subject}: ${Number(g.score)}${g.comment ? ` (${g.comment})` : ''}`).join('\n');
  return { html, text };
};

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const reply = (status: number, message: string) =>
    new Response(JSON.stringify({ message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply(405, 'Method not allowed');

  const authorization = req.headers.get('Authorization');
  if (!authorization) return reply(401, 'Not signed in');

  let body: { class_id?: unknown; student_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, 'Invalid request body');
  }
  const classId = String(body.class_id ?? '');
  const studentId = String(body.student_id ?? '');
  if (!UUID.test(classId) || !UUID.test(studentId)) return reply(400, 'class_id and student_id are required');

  // Every query below runs as the calling admin, under RLS
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return reply(401, 'Not signed in');

  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (enrollmentError) return reply(500, 'Could not load the student');
  if (!enrollment) return reply(404, 'Student not found in this class');

  const [classResult, studentResult, gradesResult] = await Promise.all([
    supabase.from('classes').select('name').eq('id', classId).single(),
    supabase.from('students').select('name, email').eq('id', studentId).single(),
    supabase.from('grades').select('subject, score, comment').eq('enrollment_id', enrollment.id).order('subject'),
  ]);
  if (classResult.error || studentResult.error || gradesResult.error) return reply(500, 'Could not load the grades');

  const student = studentResult.data;
  const grades = gradesResult.data as Grade[];
  if (!student.email) return reply(422, `${student.name} has no email address`);
  if (!EMAIL.test(student.email)) return reply(422, `${student.name}'s email address is not valid`);
  if (grades.length === 0) return reply(422, `${student.name} has no grades in this class yet`);

  // Per-admin rate limit, so an account can't be used to send bulk mail
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('grade_emails')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);
  if (countError) return reply(500, 'Could not check the sending limit');
  if ((count ?? 0) >= MAX_EMAILS_PER_HOUR) {
    return reply(429, `Sending limit reached (${MAX_EMAILS_PER_HOUR} emails per hour). Try again later.`);
  }

  const apiKey = Deno.env.get('BREVO_API_KEY');
  const senderEmail = Deno.env.get('EMAIL_SENDER_ADDRESS');
  if (!apiKey || !senderEmail) {
    console.error('send-grade-report: BREVO_API_KEY or EMAIL_SENDER_ADDRESS is not set');
    return reply(500, 'Email sending is not configured');
  }

  const { html, text } = buildEmail(student.name, classResult.data.name, grades);
  const log = (status: 'sent' | 'failed', extra: { error?: string; provider_message_id?: string }) =>
    supabase.from('grade_emails').insert({
      class_id: classId,
      student_id: studentId,
      recipient: student.email,
      status,
      ...extra,
    });

  let providerError: string | null = null;
  let messageId: string | undefined;
  try {
    const response = await fetch(`${Deno.env.get('BREVO_API_URL') ?? 'https://api.brevo.com'}/v3/smtp/email`, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: senderEmail, name: Deno.env.get('EMAIL_SENDER_NAME') ?? 'Grades' },
        to: [{ email: student.email, name: student.name }],
        // Replies go to the admin who sent the report
        ...(userData.user.email && { replyTo: { email: userData.user.email } }),
        subject: `Your grades for ${classResult.data.name}`,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      messageId = result.messageId;
    } else {
      providerError = String(result.message ?? `Provider returned ${response.status}`).slice(0, 300);
    }
  } catch (err) {
    providerError = err instanceof Error && err.name === 'TimeoutError' ? 'Email provider timed out' : 'Email provider unreachable';
  }

  const { error: logError } = await log(providerError ? 'failed' : 'sent', {
    error: providerError ?? undefined,
    provider_message_id: messageId,
  });
  if (logError) console.error('send-grade-report: could not log the email', logError.message);

  if (providerError) return reply(502, `The email could not be sent: ${providerError}`);
  return reply(200, `Grade report sent to ${student.email}`);
});
