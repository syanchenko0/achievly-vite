import {
  getBudgetAccountingQueryKey,
  type BudgetAccountingResponseSchema,
  useCreateBudgetAccounting,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useBudgetAccountingStore } from "@/app/store/budget";

const useCreateMutation = () => {
  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useCreateBudgetAccounting({
    mutation: {
      onSettled: async (created) => {
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
          created !== undefined &&
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
                [created.variant]: [
                  ...previousBudgetAccounting.data[
                    created.variant as "income" | "expense"
                  ],
                  created,
                ],
              },
              meta: previousBudgetAccounting?.meta,
            },
          );
        }

        return { previousBudgetAccounting };
      },
    },
  });

  return { createMutation: mutateAsync, createPending: isPending };
};

export { useCreateMutation };
