import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { friendlyError, supabase, unwrap } from '../../lib/supabase';

const ROSTER_SELECT = `id, created_at,
  student:students(id, student_number, name, email),
  grades(id, subject, score, comment)`;

// Students enrolled in one class, with their grades and whether a grade report was emailed
export const useClassRoster = (classId) => {
  const queryClient = useQueryClient();
  const rosterKey = ['roster', classId];
  const refresh = () => {
    queryClient.invalidateQueries(rosterKey);
    queryClient.invalidateQueries(['classes']);
    queryClient.invalidateQueries(['students']);
  };
  const onError = (error) => toast.error(friendlyError(error));

  const { data, isLoading, error } = useQuery({
    queryKey: rosterKey,
    queryFn: async () => {
      const [enrollments, emails] = await Promise.all([
        supabase.from('enrollments').select(ROSTER_SELECT).eq('class_id', classId),
        supabase
          .from('grade_emails')
          .select('student_id, created_at')
          .eq('class_id', classId)
          .eq('status', 'sent')
          .order('created_at', { ascending: false }),
      ]);
      const lastSent = {};
      for (const row of unwrap(emails)) lastSent[row.student_id] ??= row.created_at;

      return unwrap(enrollments)
        .map((e) => ({
          enrollmentId: e.id,
          ...e.student,
          grades: [...e.grades].sort((a, b) => a.subject.localeCompare(b.subject)),
          lastSentAt: lastSent[e.student.id] ?? null,
        }))
        .sort((a, b) => a.student_number.localeCompare(b.student_number, undefined, { numeric: true }));
    },
  });

  // Adds a student to the class. A number the admin already uses enrolls that existing student.
  const addStudent = useMutation({
    mutationFn: async ({ student_number, name, email }) => {
      const existing = unwrap(
        await supabase.from('students').select('id, name').eq('student_number', student_number).maybeSingle()
      );
      const student =
        existing ??
        unwrap(await supabase.from('students').insert({ student_number, name, email: email || null }).select('id, name').single());
      const { error: enrollError } = await supabase.from('enrollments').insert({ class_id: classId, student_id: student.id });
      if (enrollError?.code === '23505') throw new Error(`${student.name} is already in this class`);
      if (enrollError) throw enrollError;
      return { student, reused: Boolean(existing) };
    },
    onSuccess: ({ student, reused }) => {
      refresh();
      toast.success(reused ? `Existing student ${student.name} added to this class` : 'Student added');
    },
    onError,
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, name, email }) =>
      unwrap(await supabase.from('students').update({ name, email: email || null }).eq('id', id)),
    onSuccess: () => {
      refresh();
      toast.success('Student updated');
    },
    onError,
  });

  const removeFromClass = useMutation({
    mutationFn: async (enrollmentId) => unwrap(await supabase.from('enrollments').delete().eq('id', enrollmentId)),
    onSuccess: () => {
      refresh();
      toast.success('Student removed from this class');
    },
    onError,
  });

  const saveGrade = useMutation({
    mutationFn: async ({ id, enrollmentId, subject, score, comment }) => {
      const values = { subject: subject.trim(), score: Number(score), comment: comment?.trim() || null };
      return unwrap(
        id
          ? await supabase.from('grades').update(values).eq('id', id)
          : await supabase.from('grades').insert({ enrollment_id: enrollmentId, ...values })
      );
    },
    onSuccess: () => queryClient.invalidateQueries(rosterKey),
    onError: (error) => toast.error(error.code === '23505' ? 'This subject already has a grade' : friendlyError(error)),
  });

  const deleteGrade = useMutation({
    mutationFn: async (id) => unwrap(await supabase.from('grades').delete().eq('id', id)),
    onSuccess: () => queryClient.invalidateQueries(rosterKey),
    onError,
  });

  // The Edge Function re-checks ownership itself; the browser never sees the email provider's key
  const sendReport = useMutation({
    mutationFn: async (studentId) => {
      const { data: result, error: fnError } = await supabase.functions.invoke('send-grade-report', {
        body: { class_id: classId, student_id: studentId },
      });
      if (fnError) {
        const body = await fnError.context?.json?.().catch(() => null);
        throw new Error(body?.message ?? 'The email could not be sent');
      }
      return result;
    },
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(error.message),
    // Failed sends are logged too, so refresh either way
    onSettled: () => queryClient.invalidateQueries(rosterKey),
  });

  return {
    roster: data ?? [],
    isLoading,
    error,
    addStudent,
    updateStudent,
    removeFromClass,
    saveGrade,
    deleteGrade,
    sendReport,
  };
};
