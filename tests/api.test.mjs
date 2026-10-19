// End-to-end checks against the local Supabase stack, calling the Data API and the Edge Function
// directly (the way an attacker would), not through the React UI.
// Needs: npm run db:start, npm run functions:serve. Run with: npm run test:api
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import { after, before, describe, test } from 'node:test';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8' }));
const API_URL = status.API_URL;
const PUBLISHABLE_KEY = status.PUBLISHABLE_KEY;
const MAILPIT_URL = status.MAILPIT_URL;
const PASSWORD = 'Passw0rd-test';

const newClient = () => createClient(API_URL, PUBLISHABLE_KEY, { auth: { persistSession: false } });

// Mock email provider (Brevo API shape) on the port the function's .env points to
const provider = { requests: [], status: 201 };
const mockServer = http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    provider.requests.push({ headers: req.headers, body: JSON.parse(body || '{}') });
    res.writeHead(provider.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(provider.status < 300 ? { messageId: '<mock@brevo>' } : { message: 'Invalid sender' }));
  });
});

// Sign up through the real flow and confirm via the link in the local mailbox
const signUpConfirmed = async (email) => {
  const client = newClient();
  const { error } = await client.auth.signUp({ email, password: PASSWORD });
  assert.ifError(error);

  const unconfirmed = await client.auth.signInWithPassword({ email, password: PASSWORD });
  assert.match(unconfirmed.error?.message ?? '', /not confirmed/i, 'sign-in is refused before email confirmation');

  let message;
  for (let i = 0; i < 20 && !message; i++) {
    const search = await (await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json();
    message = search.messages?.[0];
    if (!message) await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(message, 'confirmation email arrived');
  const full = await (await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`)).json();
  const link = full.Text.match(/https?:\/\/\S+verify\S+/)[0].replace(/&amp;/g, '&');
  await fetch(link, { redirect: 'manual' });

  const { data, error: signInError } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  assert.ifError(signInError);
  return { client, user: data.user };
};

const sendReport = (client, classId, studentId) =>
  client.functions.invoke('send-grade-report', { body: { class_id: classId, student_id: studentId } });

const errorMessage = async (error) => (await error?.context?.json?.())?.message;

describe('Supabase backend', () => {
  const run = Date.now();
  let a;
  let b;
  let ids;

  before(async () => {
    await new Promise((resolve) => mockServer.listen(4010, '0.0.0.0', resolve));
    a = await signUpConfirmed(`admin-a-${run}@example.com`);
    b = await signUpConfirmed(`admin-b-${run}@example.com`);

    const { data: cls } = await a.client.from('classes').insert({ name: 'Physics' }).select().single();
    const { data: student } = await a.client
      .from('students')
      .insert({ student_number: '2001', name: 'Noa <b>Levi</b>', email: 'noa@example.com' })
      .select()
      .single();
    const { data: enrollment } = await a.client
      .from('enrollments')
      .insert({ class_id: cls.id, student_id: student.id })
      .select()
      .single();
    await a.client.from('grades').insert([
      { enrollment_id: enrollment.id, subject: 'Mechanics', score: 88, comment: 'Solid' },
      { enrollment_id: enrollment.id, subject: 'Optics', score: 92.5 },
    ]);
    ids = { classId: cls.id, studentId: student.id, enrollmentId: enrollment.id };
  });

  after(() => mockServer.close());

  test('admin A sees their own data with nested grades', async () => {
    const { data, error } = await a.client
      .from('enrollments')
      .select('id, students(name, student_number), grades(subject, score)')
      .eq('class_id', ids.classId);
    assert.ifError(error);
    assert.equal(data.length, 1);
    assert.equal(data[0].grades.length, 2);
  });

  test('admin B cannot read, change or delete admin A\'s data through the API', async () => {
    for (const table of ['classes', 'students', 'enrollments', 'grades', 'grade_emails']) {
      const { data, error } = await b.client.from(table).select('*');
      assert.ifError(error);
      assert.deepEqual(data, [], `B sees nothing in ${table}`);
    }
    const renamed = await b.client.from('students').update({ name: 'hacked' }).eq('id', ids.studentId).select();
    assert.deepEqual(renamed.data, []);
    const deleted = await b.client.from('classes').delete().eq('id', ids.classId).select();
    assert.deepEqual(deleted.data, []);
    const stillThere = await a.client.from('students').select('name').eq('id', ids.studentId).single();
    assert.equal(stillThere.data.name, 'Noa <b>Levi</b>');

    const grade = await b.client.from('grades').insert({ enrollment_id: ids.enrollmentId, subject: 'X', score: 1 });
    assert.equal(grade.error?.code, '23503', 'B cannot add a grade to A\'s enrollment');
    const enroll = await b.client.from('enrollments').insert({ class_id: ids.classId, student_id: ids.studentId });
    assert.equal(enroll.error?.code, '23503', 'B cannot enroll into A\'s class');
  });

  test('anonymous callers get nothing', async () => {
    const anon = newClient();
    const { error } = await anon.from('students').select('*');
    assert.equal(error?.code, '42501');
    const insert = await anon.from('classes').insert({ name: 'x' });
    assert.equal(insert.error?.code, '42501');
  });

  test('student numbers are immutable and owners cannot be forged', async () => {
    const change = await a.client.from('students').update({ student_number: '9999' }).eq('id', ids.studentId);
    assert.equal(change.error?.code, '42501');
    const forged = await a.client.from('classes').insert({ name: 'Forged', owner_id: b.user.id });
    assert.equal(forged.error?.code, '42501');
    const dup = await a.client.from('students').insert({ student_number: '2001', name: 'Dup' });
    assert.equal(dup.error?.code, '23505');
  });

  test('send-grade-report emails all grades in the class, escaped, and logs it', async () => {
    provider.requests = [];
    provider.status = 201;
    const { data, error } = await sendReport(a.client, ids.classId, ids.studentId);
    assert.ifError(error);
    assert.match(data.message, /sent to noa@example.com/);

    assert.equal(provider.requests.length, 1);
    const sent = provider.requests[0];
    assert.equal(sent.headers['api-key'], 'local-test-key');
    assert.deepEqual(sent.body.to, [{ email: 'noa@example.com', name: 'Noa <b>Levi</b>' }]);
    assert.equal(sent.body.subject, 'Your grades for Physics');
    assert.match(sent.body.htmlContent, /Mechanics/);
    assert.match(sent.body.htmlContent, /Optics/);
    assert.ok(!sent.body.htmlContent.includes('<b>Levi</b>'), 'student name is HTML-escaped');
    assert.equal(sent.body.replyTo.email, a.user.email);

    const log = await a.client.from('grade_emails').select('status, recipient').eq('student_id', ids.studentId);
    assert.deepEqual(log.data, [{ status: 'sent', recipient: 'noa@example.com' }]);
  });

  test('send-grade-report refuses another admin\'s student without calling the provider', async () => {
    provider.requests = [];
    const { error } = await sendReport(b.client, ids.classId, ids.studentId);
    assert.equal(error?.context?.status, 404);
    assert.equal(provider.requests.length, 0);
  });

  test('send-grade-report requires a signed-in caller', async () => {
    const { error } = await sendReport(newClient(), ids.classId, ids.studentId);
    assert.equal(error?.context?.status, 401);
  });

  test('send-grade-report handles missing email, no grades and provider failures', async () => {
    const { data: noEmail } = await a.client.from('students').insert({ student_number: '2002', name: 'No Mail' }).select().single();
    const { data: e2 } = await a.client.from('enrollments').insert({ class_id: ids.classId, student_id: noEmail.id }).select().single();
    await a.client.from('grades').insert({ enrollment_id: e2.id, subject: 'Mechanics', score: 70 });
    let result = await sendReport(a.client, ids.classId, noEmail.id);
    assert.equal(result.error?.context?.status, 422);
    assert.match(await errorMessage(result.error), /no email address/);

    const { data: noGrades } = await a.client.from('students').insert({ student_number: '2003', name: 'New', email: 'new@example.com' }).select().single();
    await a.client.from('enrollments').insert({ class_id: ids.classId, student_id: noGrades.id });
    result = await sendReport(a.client, ids.classId, noGrades.id);
    assert.equal(result.error?.context?.status, 422);

    provider.status = 400;
    result = await sendReport(a.client, ids.classId, ids.studentId);
    assert.equal(result.error?.context?.status, 502);
    assert.match(await errorMessage(result.error), /Invalid sender/);
    const failed = await a.client.from('grade_emails').select('status, error').eq('status', 'failed');
    assert.equal(failed.data.length, 1);
    provider.status = 201;
  });

  test('send-grade-report enforces the hourly limit', async () => {
    const rows = Array.from({ length: 30 }, () => ({
      class_id: ids.classId,
      student_id: ids.studentId,
      recipient: 'noa@example.com',
      status: 'sent',
    }));
    await a.client.from('grade_emails').insert(rows);
    provider.requests = [];
    const { error } = await sendReport(a.client, ids.classId, ids.studentId);
    assert.equal(error?.context?.status, 429);
    assert.equal(provider.requests.length, 0);
  });
});
