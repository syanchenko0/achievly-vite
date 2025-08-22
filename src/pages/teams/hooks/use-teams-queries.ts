import { useQueryClient } from "@tanstack/react-query";
import {
  getTeamQueryKey,
  type TeamDto,
  useDeleteTeamMember,
  useUpdateTeamMember,
} from "@/shared/api";
import { socket } from "@/app/lib/socket";
import { useTeamSettingsStore } from "@/app/store/team";

const useTeamsQueries = () => {
  const queryClient = useQueryClient();

  const team_id = useTeamSettingsStore((state) => state.activeTeamId);

  const { mutateAsync: updateTeamMember, isPending: updateTeamMemberPending } =
    useUpdateTeamMember({
      mutation: {
        onMutate: async (updated) => {
          await queryClient.cancelQueries({
            queryKey: getTeamQueryKey({ team_id: updated.team_id }),
          });
          const previousTeamData = queryClient.getQueryData<TeamDto>(
            getTeamQueryKey({ team_id: updated.team_id }),
          );
          if (previousTeamData) {
            queryClient.setQueryData<TeamDto>(
              getTeamQueryKey({ team_id: updated.team_id }),
              {
                ...previousTeamData,
                members: previousTeamData.members.map((member) => {
                  if (member.id === Number(updated.member_id)) {
                    return {
                      ...member,
                      ...updated.data,
                    };
                  }
                  return member;
                }),
              },
            );
          }

          return { previousTeamData };
        },
        onSuccess: () => {
          const teamData = queryClient.getQueryData<TeamDto>(
            getTeamQueryKey({ team_id: team_id as string }),
          );

          socket.emit("projects_list_invalidation", {
            members: teamData?.members?.map((member) => String(member.id)),
            team_id: String(team_id),
          });
        },
      },
    });

  const { mutateAsync: deleteTeamMember, isPending: deleteTeamMemberPending } =
    useDeleteTeamMember({
      mutation: {
        onMutate: async (deleted) => {
          await queryClient.cancelQueries({
            queryKey: getTeamQueryKey({ team_id: team_id as string }),
          });

          const previousTeamData = queryClient.getQueryData<TeamDto>(
            getTeamQueryKey({ team_id: team_id as string }),
          );

          if (previousTeamData) {
            queryClient.setQueryData<TeamDto>(
              getTeamQueryKey({ team_id: team_id as string }),
              {
                ...previousTeamData,
                members: previousTeamData.members.filter(
                  (member) => member.id !== Number(deleted.member_id),
                ),
              },
            );
          }

          return { previousTeamData };
        },
      },
    });

  return {
    updateTeamMember,
    updateTeamMemberPending,
    deleteTeamMember,
    deleteTeamMemberPending,
  };
};

export { useTeamsQueries };
