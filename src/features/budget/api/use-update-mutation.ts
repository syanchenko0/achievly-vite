import {
  getBudgetAccountingQueryKey,
  useUpdateBudgetAccounting,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useBudgetAccountingStore } from "@/app/store/budget";

const useUpdateMutation = () => {
  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useUpdateBudgetAccounting({
    mutation: {
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: getBudgetAccountingQueryKey({
            month,
            year,
          }),
        });
      },
    },
  });

  return { updateMutation: mutateAsync, updatePending: isPending };
};

export { useUpdateMutation };
