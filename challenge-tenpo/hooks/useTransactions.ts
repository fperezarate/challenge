'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, createTransaction } from '@/lib/api';
import type { TransactionInput } from '@/app/types/transaction';

export const transactionsQueryKey = ['transactions'] as const;

export function useTransactions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getTransactions,
  });

  const createMutation = useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: TransactionInput;
      idempotencyKey: string;
    }) => createTransaction(input, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionsQueryKey });
    },
  });

  const createTransactionWithIdempotency = async (input: TransactionInput) => {
    const idempotencyKey = crypto.randomUUID();
    return createMutation.mutateAsync({ input, idempotencyKey });
  };

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createTransaction: createTransactionWithIdempotency,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
