import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { friendlyError, supabase, unwrap } from '../../lib/supabase';

// All of the signed-in admin's students, across classes (RLS limits the rows to this admin)
export const useStudents = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries(['students']);
    queryClient.invalidateQueries(['roster']);
    queryClient.invalidateQueries(['classes']);
  };
  const onError = (error) => toast.error(friendlyError(error));

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('students')
          .select('id, student_number, name, email, enrollments(classes(id, name))')
          .order('name')
      ).map(({ enrollments, ...student }) => ({ ...student, classes: enrollments.map((e) => e.classes) })),
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

  // Removes the student from every class, with their grades
  const deleteStudent = useMutation({
    mutationFn: async (id) => unwrap(await supabase.from('students').delete().eq('id', id)),
    onSuccess: () => {
      refresh();
      toast.success('Student deleted');
    },
    onError,
  });

  return { students, isLoading, error, updateStudent, deleteStudent };
};
