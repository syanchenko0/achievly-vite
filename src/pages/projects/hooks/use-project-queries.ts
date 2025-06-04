import { useParams } from "react-router";
import {
  getProjectQueryKey,
  type ProjectDto,
  type ProjectTaskDto,
  useCreateProjectColumn,
  useDeleteProjectColumn,
  useDeleteProjectTask,
  useGetProject,
  useUpdateProject,
  useUpdateProjectColumn,
  useUpdateProjectTask,
  useUpdateProjectTaskListOrder,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";

const useProjectQueries = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const { data: project, isLoading: projectLoading } = useGetProject(
    {
      project_id: project_id as string,
    },
    { query: { enabled: !!project_id } },
  );

  const queryClient = useQueryClient();

  const { mutate: createProjectColumn, isPending: createProjectColumnPending } =
    useCreateProjectColumn({
      mutation: {
        onSettled: async (created) => {
          await queryClient.cancelQueries({
            queryKey: getProjectQueryKey({
              project_id: project_id as string,
            }),
          });

          const previousProjectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          if (created && previousProjectData)
            queryClient.setQueryData<ProjectDto>(
              getProjectQueryKey({
                project_id: project_id as string,
              }),
              {
                ...previousProjectData,
                columns: [...(previousProjectData?.columns ?? []), created],
              },
            );

          return { previousProjectData };
        },
      },
    });

  const { mutate: updateProject } = useUpdateProject({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.cancelQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        });

        const previousProjectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        if (updated && previousProjectData)
          queryClient.setQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              columns: updated?.data?.columns ?? previousProjectData?.columns,
            },
          );

        return { previousProjectData };
      },
    },
  });

  const { mutate: updateProjectTask, isPending: updateProjectTaskPending } =
    useUpdateProjectTask({
      mutation: {
        onMutate: async (updated) => {
          await queryClient.cancelQueries({
            queryKey: getProjectQueryKey({
              project_id: project_id as string,
            }),
          });

          const previousProjectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          queryClient.setQueryData(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              project_tasks: (previousProjectData?.project_tasks ?? []).map(
                (task) => {
                  if (task.id === updated.task_id) {
                    return {
                      ...task,
                      ...updated.data,
                    };
                  }
                  return task;
                },
              ),
            },
          );

          return { previousProjectData };
        },
      },
    });

  const { mutate: updateProjectTaskListOrder } = useUpdateProjectTaskListOrder({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.cancelQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        });

        const previousProjectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        if (previousProjectData)
          queryClient.setQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              project_tasks: previousProjectData?.project_tasks
                ?.map((task) => {
                  const update = updated?.data?.find((d) => d.id === task.id);
                  if (update) {
                    return {
                      ...task,
                      list_order: update.list_order,
                    };
                  }

                  return task;
                })
                .sort(
                  (a, b) =>
                    ((a as ProjectTaskDto & { list_order: number })
                      .list_order ?? -1) -
                    ((b as ProjectTaskDto & { list_order: number })
                      .list_order ?? 0),
                ),
            },
          );

        return { previousProjectData };
      },
    },
  });

  const { mutate: updateProjectColumn } = useUpdateProjectColumn({
    mutation: {
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        });

        const previousProjectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        if (previousProjectData) {
          queryClient.setQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              columns: previousProjectData.columns.map((column) => {
                if (column.id === data.column_id) {
                  return {
                    ...column,
                    ...data.data,
                  };
                }
                return column;
              }),
            },
          );
        }
      },
    },
  });

  const { mutate: deleteProjectTask, isPending: deleteProjectTaskPending } =
    useDeleteProjectTask({
      mutation: {
        onMutate: async ({ task_id, project_id }) => {
          await queryClient.cancelQueries({
            queryKey: getProjectQueryKey({
              project_id: project_id as string,
            }),
          });

          const previousProjectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          if (previousProjectData) {
            queryClient.setQueryData<ProjectDto>(
              getProjectQueryKey({
                project_id: project_id as string,
              }),
              {
                ...previousProjectData,
                project_tasks: previousProjectData?.project_tasks?.filter(
                  (task) => task.id !== Number(task_id),
                ),
              },
            );
          }

          return { previousProjectData };
        },
      },
    });

  const { mutate: deleteProjectColumn, isPending: deleteProjectColumnPending } =
    useDeleteProjectColumn({
      mutation: {
        onMutate: async ({ column_id, project_id }) => {
          await queryClient.cancelQueries({
            queryKey: getProjectQueryKey({
              project_id: String(project_id),
            }),
          });

          const previousProjectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: String(project_id),
            }),
          );

          if (previousProjectData) {
            queryClient.setQueryData<ProjectDto>(
              getProjectQueryKey({
                project_id: String(project_id),
              }),
              {
                ...previousProjectData,
                columns: previousProjectData?.columns?.filter(
                  (column) => column.id !== column_id,
                ),
              },
            );
          }

          return { previousProjectData };
        },
      },
    });

  return {
    project,
    projectLoading,
    createProjectColumn,
    createProjectColumnPending,
    updateProject,
    updateProjectTask,
    updateProjectTaskPending,
    updateProjectTaskListOrder,
    updateProjectColumn,
    deleteProjectTask,
    deleteProjectTaskPending,
    deleteProjectColumn,
    deleteProjectColumnPending,
  };
};

export { useProjectQueries };
