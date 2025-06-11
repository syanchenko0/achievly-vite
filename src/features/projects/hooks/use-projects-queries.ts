import {
  getProjectsGeneralInfoQueryKey,
  getProjectsQueryKey,
  getTeamQueryKey,
  type ShortInfoProjectDto,
  useCreateProject,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamSettingsStore } from "@/app/store/team";

const useProjectsQueries = () => {
  const team_id = useTeamSettingsStore((state) => state.activeTeamId);

  const queryClient = useQueryClient();

  const { mutateAsync: createProject, isPending: createProjectPending } =
    useCreateProject({
      mutation: {
        onSettled: async (newProject) => {
          await queryClient.cancelQueries({
            queryKey: getProjectsQueryKey({ team_id: team_id as string }),
          });

          const previousProjects = queryClient.getQueryData<
            ShortInfoProjectDto[]
          >(getProjectsQueryKey({ team_id: team_id as string }));

          queryClient.setQueryData(
            getProjectsQueryKey({ team_id: team_id as string }),
            [...(previousProjects || []), newProject],
          );

          return { previousProjects };
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

  return { createProject, createProjectPending };
};

export { useProjectsQueries };
