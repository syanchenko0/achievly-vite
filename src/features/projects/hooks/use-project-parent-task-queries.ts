import {
  getProjectQueryKey,
  getProjectsGeneralInfoQueryKey,
  getTeamQueryKey,
  type ProjectDto,
  useCreateProjectParentTask,
  useUpdateProjectParentTask,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamSettingsStore } from "@/app/store/team";
import { socket } from "@/app/lib/socket";
import { useParams } from "react-router";

const useProjectParentTaskQueries = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const team_id = useTeamSettingsStore((state) => state.activeTeamId);

  const queryClient = useQueryClient();

  const {
    mutateAsync: createProjectParentTask,
    isPending: createProjectParentTaskPending,
  } = useCreateProjectParentTask({
    mutation: {
      onSettled: async (newProjectParentTask) => {
        await queryClient.cancelQueries({
          queryKey: getProjectQueryKey({ project_id: String(project_id) }),
        });

        const previousProject = queryClient.getQueryData<ProjectDto>(
          getProjectQueryKey({ project_id: String(project_id) }),
        );

        queryClient.setQueryData(
          getProjectQueryKey({ project_id: String(project_id) }),
          {
            ...previousProject,
            project_parent_tasks: [
              ...(previousProject?.project_parent_tasks ?? []),
              newProjectParentTask,
            ],
          },
        );

        return { previousProject };
      },
      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: getTeamQueryKey({ team_id: team_id as string }),
          })
          .then();

        queryClient
          .invalidateQueries({
            queryKey: getProjectsGeneralInfoQueryKey({
              team_id: Number(team_id),
            }),
          })
          .then();
      },
    },
  });

  const {
    mutateAsync: updateProjectParentTask,
    isPending: updateProjectParentTaskPending,
  } = useUpdateProjectParentTask({
    mutation: {
      onSettled: async () => {
        if (team_id !== null) {
          await queryClient.invalidateQueries({
            queryKey: getProjectsGeneralInfoQueryKey({
              team_id: Number(team_id),
            }),
          });

          await queryClient.invalidateQueries({
            queryKey: getProjectQueryKey({
              project_id: String(project_id),
            }),
          });
        }
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
        });
      },
    },
  });

  return {
    createProjectParentTask,
    createProjectParentTaskPending,
    updateProjectParentTask,
    updateProjectParentTaskPending,
  };
};

export { useProjectParentTaskQueries };
