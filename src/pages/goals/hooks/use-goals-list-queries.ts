import {
  getGoalsQueryKey,
  type GoalDto,
  type TaskDto,
  useGetGoals,
  useUpdateGoal,
  useUpdateGoalListOrder,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const useGoalsListQueries = () => {
  const { data: allGoals, isLoading: allGoalsLoading } = useGetGoals({
    params: undefined,
  });

  const queryClient = useQueryClient();

  const { mutate: updateGoal } = useUpdateGoal({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.cancelQueries({ queryKey: getGoalsQueryKey() });

        const previousGoals =
          queryClient.getQueryData<GoalDto[]>(getGoalsQueryKey());

        queryClient.setQueryData<GoalDto[]>(
          getGoalsQueryKey(),
          previousGoals?.map((goal) => {
            if (goal.id === Number(updated.goal_id)) {
              return {
                ...goal,
                ...updated.data,
                tasks:
                  (updated.data?.tasks as TaskDto[]) ||
                  (goal?.tasks as TaskDto[]),
              };
            }
            return goal;
          }),
        );

        return { previousGoals };
      },
    },
  });

  const { mutate: updateGoalListOrder } = useUpdateGoalListOrder({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.cancelQueries({ queryKey: getGoalsQueryKey() });

        const previousGoals =
          queryClient.getQueryData<GoalDto[]>(getGoalsQueryKey());

        queryClient.setQueryData<GoalDto[]>(
          getGoalsQueryKey(),
          previousGoals
            ?.map((t) => {
              const update = updated?.data?.find((d) => d.id === t.id);
              if (update) {
                return {
                  ...t,
                  list_order: update.list_order,
                };
              }
              return t;
            })
            ?.sort(
              (a, b) =>
                ((a as GoalDto & { list_order: number })?.list_order ?? 0) -
                ((b as GoalDto & { list_order: number })?.list_order ?? 0),
            ),
        );

        return { previousGoals };
      },
    },
  });

  const initialGoals = useMemo(
    () => ({
      active: allGoals?.filter((goal) => !goal.achieved_date) || [],
      done: allGoals?.filter((goal) => goal.achieved_date) || [],
    }),
    [allGoals],
  );

  return {
    initialGoals,
    allGoalsLoading,
    updateGoal,
    updateGoalListOrder,
  };
};

export { useGoalsListQueries };
