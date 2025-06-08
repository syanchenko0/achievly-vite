import {
  getGoalsGeneralInfoQueryKey,
  getTasksQueryKey,
  type TaskDto,
  useGetTasks,
  useUpdateTask,
  useUpdateTaskListOrder,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const useGoalsTasksQueries = () => {
  const { data: allTasks, isLoading: allTasksLoading } = useGetTasks({
    params: undefined,
  });

  const queryClient = useQueryClient();

  const { mutate: updateTask } = useUpdateTask({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.invalidateQueries({
          queryKey: getGoalsGeneralInfoQueryKey(),
        });

        await queryClient.cancelQueries({ queryKey: getTasksQueryKey() });

        const previousTasks =
          queryClient.getQueryData<TaskDto[]>(getTasksQueryKey());

        queryClient.setQueryData<TaskDto[]>(
          getTasksQueryKey(),
          previousTasks?.map((task) => {
            if (task.id === Number(updated.task_id)) {
              return {
                ...task,
                ...updated.data,
              };
            }
            return task;
          }),
        );

        return { previousTasks };
      },
    },
  });

  const { mutate: updateTaskListOrder } = useUpdateTaskListOrder({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.invalidateQueries({
          queryKey: getGoalsGeneralInfoQueryKey(),
        });

        await queryClient.cancelQueries({ queryKey: getTasksQueryKey() });

        const previousTasks =
          queryClient.getQueryData<TaskDto[]>(getTasksQueryKey());

        queryClient.setQueryData<TaskDto[]>(
          getTasksQueryKey(),
          previousTasks
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
                ((a as TaskDto & { list_order: number })?.list_order ?? 0) -
                ((b as TaskDto & { list_order: number })?.list_order ?? 0),
            ),
        );

        return { previousTasks };
      },
    },
  });

  const initialTasks = useMemo(
    () => ({
      active: allTasks?.filter((t) => !t.done_date) || [],
      done: allTasks?.filter((t) => t.done_date) || [],
    }),
    [allTasks],
  );

  return {
    allTasks,
    initialTasks,
    allTasksLoading,
    updateTask,
    updateTaskListOrder,
  };
};

export { useGoalsTasksQueries };
