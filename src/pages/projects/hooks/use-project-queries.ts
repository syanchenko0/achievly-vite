import { useNavigate, useParams } from "react-router";
import {
  getProjectQueryKey,
  getProjectsGeneralInfoQueryKey,
  getProjectsQueryKey,
  type ProjectDto,
  type ProjectTaskDto,
  type ShortInfoProjectDto,
  useCreateProjectColumn,
  useCreateProjectTask,
  useDeleteProject,
  useDeleteProjectColumn,
  useDeleteProjectTask,
  useGetProject,
  useUpdateProject,
  useUpdateProjectColumn,
  useUpdateProjectTask,
  useUpdateProjectTaskListOrder,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamSettingsStore } from "@/app/store/team";
import { ROUTES } from "@/shared/constants/router";
import { useProjectSocket } from "@/pages/projects/ui/project-wrapper";

const useProjectQueries = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const navigate = useNavigate();

  const projectsSocket = useProjectSocket();

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
          if (activeTeamId !== null) {
            await queryClient.invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(activeTeamId),
              }),
            });
          }

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

          if (created && previousProjectData) {
            queryClient.setQueryData<ProjectDto>(
              getProjectQueryKey({
                project_id: project_id as string,
              }),
              {
                ...previousProjectData,
                columns: [...(previousProjectData?.columns ?? []), created],
              },
            );
          }

          return { previousProjectData };
        },
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  const { mutate: createProjectTask, isPending: createProjectTaskPending } =
    useCreateProjectTask({
      mutation: {
        onSettled: async (newProjectTask) => {
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
              project_tasks: [
                ...(previousProjectData?.project_tasks ?? []),
                newProjectTask,
              ],
            },
          );

          return { previousProjectData };
        },
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  const { mutate: updateProject } = useUpdateProject({
    mutation: {
      onMutate: async (updated) => {
        if (activeTeamId !== null) {
          await queryClient.invalidateQueries({
            queryKey: getProjectsGeneralInfoQueryKey({
              team_id: Number(activeTeamId),
            }),
          });
        }

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

        if (updated && previousProjectData) {
          queryClient.setQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              columns: updated?.data?.columns ?? previousProjectData?.columns,
            },
          );
        }

        return { previousProjectData };
      },
      onSuccess: () => {
        projectsSocket.emit("project_invalidation", {
          project_id,
        });
      },
    },
  });

  const { mutate: updateProjectTask, isPending: updateProjectTaskPending } =
    useUpdateProjectTask({
      mutation: {
        onMutate: async (updated) => {
          if (activeTeamId !== null) {
            await queryClient.invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(activeTeamId),
              }),
            });
          }

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
                      executor:
                        updated.data?.executor_member_id !== undefined
                          ? previousProjectData?.team?.members?.find(
                              (member) =>
                                member.id === updated.data?.executor_member_id,
                            )
                          : task.executor,
                    };
                  }
                  return task;
                },
              ),
            },
          );

          return { previousProjectData };
        },
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  const { mutate: updateProjectTaskListOrder } = useUpdateProjectTaskListOrder({
    mutation: {
      onMutate: async (updated) => {
        if (activeTeamId !== null) {
          await queryClient.invalidateQueries({
            queryKey: getProjectsGeneralInfoQueryKey({
              team_id: Number(activeTeamId),
            }),
          });
        }

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
          const ids = updated?.data?.map((data) => data.id);

          const updatedTasks = previousProjectData?.project_tasks
            ?.filter((task) => ids?.includes(task.id))
            ?.map((task) => ({
              ...task,
              list_order: updated?.data?.find((d) => d.id === task.id)
                ?.list_order,
            }))
            .sort(
              (a, b) =>
                ((a as ProjectTaskDto & { list_order: number })?.list_order ??
                  -1) -
                ((b as ProjectTaskDto & { list_order: number })?.list_order ??
                  0),
            );

          const previousTask = previousProjectData?.project_tasks?.filter(
            (task) => !ids?.includes(task.id),
          );

          queryClient.setQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              project_tasks: (previousTask ?? []).concat(updatedTasks ?? []),
            },
          );
        }

        return { previousProjectData };
      },
      onSuccess: () => {
        projectsSocket.emit("project_invalidation", {
          project_id,
        });
      },
    },
  });

  const { mutate: updateProjectColumn } = useUpdateProjectColumn({
    mutation: {
      onMutate: async (data) => {
        if (activeTeamId !== null) {
          await queryClient.invalidateQueries({
            queryKey: getProjectsGeneralInfoQueryKey({
              team_id: Number(activeTeamId),
            }),
          });
        }

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

        return { previousProjectData };
      },
      onSuccess: () => {
        projectsSocket.emit("project_invalidation", {
          project_id,
        });
      },
    },
  });

  const { mutate: deleteProjectTask, isPending: deleteProjectTaskPending } =
    useDeleteProjectTask({
      mutation: {
        onMutate: async ({ task_id, project_id }) => {
          if (activeTeamId !== null) {
            await queryClient.invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(activeTeamId),
              }),
            });
          }

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
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  const { mutate: deleteProjectColumn, isPending: deleteProjectColumnPending } =
    useDeleteProjectColumn({
      mutation: {
        onMutate: async ({ column_id, project_id }) => {
          if (activeTeamId !== null) {
            await queryClient.invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(activeTeamId),
              }),
            });
          }

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
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  const { mutate: deleteProject, isPending: deleteProjectPending } =
    useDeleteProject({
      mutation: {
        onMutate: async ({ project_id }) => {
          if (activeTeamId !== null) {
            await queryClient.invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(activeTeamId),
              }),
            });
          }

          await queryClient.cancelQueries({
            queryKey: getProjectsQueryKey({ team_id: activeTeamId as string }),
          });

          const previousProjects = queryClient.getQueryData<
            ShortInfoProjectDto[]
          >(getProjectsQueryKey({ team_id: activeTeamId as string }));

          if (previousProjects) {
            queryClient.setQueryData<ShortInfoProjectDto[]>(
              getProjectsQueryKey({ team_id: activeTeamId as string }),
              previousProjects.filter(
                (project) => project.id !== Number(project_id),
              ),
            );
          }

          navigate(ROUTES.home);

          return { previousProjects };
        },
        onSuccess: () => {
          projectsSocket.emit("project_invalidation", {
            project_id,
          });
        },
      },
    });

  return {
    project,
    projectLoading,
    createProjectColumn,
    createProjectColumnPending,
    createProjectTask,
    createProjectTaskPending,
    updateProject,
    updateProjectTask,
    updateProjectTaskPending,
    updateProjectTaskListOrder,
    updateProjectColumn,
    deleteProject,
    deleteProjectPending,
    deleteProjectTask,
    deleteProjectTaskPending,
    deleteProjectColumn,
    deleteProjectColumnPending,
  };
};

export { useProjectQueries };
