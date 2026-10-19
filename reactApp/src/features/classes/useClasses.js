import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { friendlyError, supabase, unwrap } from '../../lib/supabase';

// RLS returns only the signed-in admin's classes; owner_id is filled in by the database
export const useClasses = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries(['classes']);
  const onError = (error) => toast.error(friendlyError(error));

  const { data: classes = [], isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: async () =>
      unwrap(await supabase.from('classes').select('id, name, created_at, enrollments(count)').order('name')),
  });

  const createClass = useMutation({
    mutationFn: async (name) => unwrap(await supabase.from('classes').insert({ name: name.trim() }).select().single()),
    onSuccess: () => {
      invalidate();
      toast.success('Class created');
    },
    onError,
  });

  const renameClass = useMutation({
    mutationFn: async ({ id, name }) => unwrap(await supabase.from('classes').update({ name: name.trim() }).eq('id', id)),
    onSuccess: () => {
      invalidate();
      toast.success('Class renamed');
    },
    onError,
  });

  const deleteClass = useMutation({
    mutationFn: async (id) => unwrap(await supabase.from('classes').delete().eq('id', id)),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries(['students']);
      toast.success('Class deleted');
    },
    onError,
  });

  return {
    classes,
    isLoading,
    error,
    createClass: createClass.mutate,
    renameClass: renameClass.mutate,
    deleteClass: deleteClass.mutate,
    isCreating: createClass.isLoading,
  };
};

export const useClass = (classId) =>
  useQuery({
    queryKey: ['class', classId],
    queryFn: async () => unwrap(await supabase.from('classes').select('id, name').eq('id', classId).maybeSingle()),
  });
