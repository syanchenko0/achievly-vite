import {
  getBudgetAccountingQueryKey,
  type BudgetAccountingResponseSchema,
  useDeleteBudgetAccounting,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useBudgetAccountingStore } from "@/app/store/budget";

const useDeleteMutation = () => {
  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useDeleteBudgetAccounting({
    mutation: {
      onMutate: async (deleted) => {
        await queryClient.cancelQueries({
          queryKey: getBudgetAccountingQueryKey({
            month,
            year,
          }),
        });
        const previousBudgetAccounting =
          queryClient.getQueryData<BudgetAccountingResponseSchema>(
            getBudgetAccountingQueryKey({
              month,
              year,
            }),
          );
        if (
          deleted !== undefined &&
          previousBudgetAccounting?.meta !== undefined
        ) {
          queryClient.setQueryData<BudgetAccountingResponseSchema>(
            getBudgetAccountingQueryKey({
              month,
              year,
            }),
            {
              data: {
                ...previousBudgetAccounting.data,
                income: previousBudgetAccounting.data.income.filter(
                  (item) => item.id !== deleted.id,
                ),
                expense: previousBudgetAccounting.data.expense.filter(
                  (item) => item.id !== deleted.id,
                ),
              },
              meta: previousBudgetAccounting?.meta,
            },
          );
        }

        return { previousBudgetAccounting };
      },
    },
  });

  return { deleteMutation: mutateAsync, deletePending: isPending };
};

export { useDeleteMutation };
