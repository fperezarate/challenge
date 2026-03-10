'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecipients, createRecipient } from '@/lib/api';
import type { RecipientInput } from '@/app/types/recipient';

export const recipientsQueryKey = ['recipients'] as const;

export function useRecipients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: recipientsQueryKey,
    queryFn: getRecipients,
  });

  const createMutation = useMutation({
    mutationFn: createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipientsQueryKey });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createRecipient: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
