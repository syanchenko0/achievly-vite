import { useNavigate, useParams } from "react-router";
import {
  getProjectQueryKey,
  getProjectsGeneralInfoQueryKey,
  getProjectsQueryKey,
  getTeamQueryKey,
  type ProjectDto,
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
import { socket } from "@/app/lib/socket";

const useProjectQueries = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const navigate = useNavigate();

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useGetProject(
    {
      project_id: project_id as string,
    },
    { query: { enabled: !!project_id } },
  );

  const queryClient = useQueryClient();

  const {
    mutateAsync: createProjectColumn,
    isPending: createProjectColumnPending,
  } = useCreateProjectColumn({
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
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
          project_id,
        });
      },
    },
  });

  const {
    mutateAsync: createProjectTask,
    isPending: createProjectTaskPending,
  } = useCreateProjectTask({
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
            project_parent_tasks: (
              previousProjectData?.project_parent_tasks ?? []
            ).map((parent_task) => {
              if (parent_task.id === newProjectTask?.parent_task?.id) {
                return {
                  ...parent_task,
                  project_tasks: [
                    ...(parent_task.project_tasks ?? []),
                    newProjectTask,
                  ],
                };
              }
              return parent_task;
            }),
            project_tasks: [
              ...(previousProjectData?.project_tasks ?? []),
              newProjectTask,
            ],
          },
        );

        return { previousProjectData };
      },
      onSuccess: () => {
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
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
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
          project_id,
        });
      },
    },
  });

  const {
    mutateAsync: updateProjectTask,
    isPending: updateProjectTaskPending,
  } = useUpdateProjectTask({
    mutation: {
      onSettled: async (project_task) => {
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

        const newProjectTasks = (previousProjectData?.project_tasks ?? []).map(
          (task) => {
            if (task.id === project_task?.id) {
              return {
                ...task,
                ...project_task,
              };
            }
            return task;
          },
        );

        queryClient.setQueryData(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
          {
            ...previousProjectData,
            project_parent_tasks: (
              previousProjectData?.project_parent_tasks ?? []
            ).map((parent_task) => {
              return {
                ...parent_task,
                project_tasks: newProjectTasks?.filter(
                  (task) => task.parent_task?.id === parent_task.id,
                ),
              };
            }),
            project_tasks: newProjectTasks,
          },
        );
      },
      onSuccess: () => {
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
          project_id,
        });
      },
    },
  });

  const { mutateAsync: updateProjectTaskListOrder } =
    useUpdateProjectTaskListOrder({
      mutation: {
        onSettled: async (data) => {
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

          const otherProjectTasks = previousProjectData?.project_tasks?.filter(
            (task) => !data?.map((d) => d.id).includes(task.id),
          );

          queryClient.setQueryData(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              project_tasks: (otherProjectTasks ?? []).concat(data ?? []),
            },
          );
        },
        onSuccess: () => {
          const projectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          socket.emit("project_invalidation", {
            members: projectData?.team?.members?.map((member) =>
              String(member.id),
            ),
            project_id,
          });
        },
      },
    });

  const {
    mutateAsync: updateProjectColumn,
    isPending: updateProjectColumnPending,
  } = useUpdateProjectColumn({
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
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
          project_id,
        });
      },
    },
  });

  const {
    mutateAsync: deleteProjectTask,
    isPending: deleteProjectTaskPending,
  } = useDeleteProjectTask({
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
              project_parent_tasks:
                previousProjectData?.project_parent_tasks?.map(
                  (parent_task) => {
                    if (
                      parent_task?.project_tasks?.some(
                        (task) => task.id === Number(task_id),
                      )
                    ) {
                      return {
                        ...parent_task,
                        project_tasks: parent_task?.project_tasks?.filter(
                          (task) => task.id !== Number(task_id),
                        ),
                      };
                    }

                    return parent_task;
                  },
                ),
              project_tasks: previousProjectData?.project_tasks?.filter(
                (task) => task.id !== Number(task_id),
              ),
            },
          );
        }

        return { previousProjectData };
      },
      onSuccess: () => {
        const projectData = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({
            project_id: project_id as string,
          }),
        );

        socket.emit("project_invalidation", {
          members: projectData?.team?.members?.map((member) =>
            String(member.id),
          ),
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
          const projectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          socket.emit("project_invalidation", {
            members: projectData?.team?.members?.map((member) =>
              String(member.id),
            ),
            project_id,
          });
        },
      },
    });

  const { mutateAsync: deleteProject, isPending: deleteProjectPending } =
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
          const projectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          queryClient
            .invalidateQueries({
              queryKey: getTeamQueryKey({
                team_id: String(projectData?.team?.id),
              }),
            })
            .then();

          queryClient
            .invalidateQueries({
              queryKey: getProjectsGeneralInfoQueryKey({
                team_id: Number(projectData?.team?.id),
              }),
            })
            .then();

          socket.emit("project_invalidation", {
            members: projectData?.team?.members?.map((member) =>
              String(member.id),
            ),
            project_id,
          });

          socket.emit("projects_list_invalidation", {
            members: projectData?.team?.members?.map((member) =>
              String(member.id),
            ),
            team_id: String(projectData?.team?.id),
          });
        },
      },
    });

  return {
    project,
    projectLoading,
    projectError,
    createProjectColumn,
    createProjectColumnPending,
    createProjectTask,
    createProjectTaskPending,
    updateProject,
    updateProjectTask,
    updateProjectTaskPending,
    updateProjectTaskListOrder,
    updateProjectColumn,
    updateProjectColumnPending,
    deleteProject,
    deleteProjectPending,
    deleteProjectTask,
    deleteProjectTaskPending,
    deleteProjectColumn,
    deleteProjectColumnPending,
  };
};

export { useProjectQueries };
