import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  getTeamsQueryKey,
  useGetTeamGeneralInfo,
  useJoinTeam,
} from "@/shared/api";
import { Loader } from "@/shared/ui/loader";
import { declension } from "@/app/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/shared/constants/router";

function TeamJoin() {
  const { team_id } = useParams<{ team_id: string }>();

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const join_access_token = searchParams.get("jat");

  const { data: team, isLoading: teamLoading } = useGetTeamGeneralInfo(
    { team_id: team_id as string },
    { query: { enabled: !!team_id && !!join_access_token } },
  );

  const { mutate, isPending } = useJoinTeam({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getTeamsQueryKey() });
        navigate(ROUTES.home);
      },
    },
  });

  const handleJoin = () => {
    if (team_id && join_access_token)
      mutate({
        id: team_id,
        params: { jat: join_access_token },
      });
  };

  if (teamLoading) {
    return (
      <div className="bg-sidebar flex size-full items-center justify-center rounded-md border px-2 py-4">
        <Loader />
      </div>
    );
  }

  if (!join_access_token) {
    return (
      <div className="bg-sidebar flex size-full items-center justify-center rounded-md border px-2 py-4">
        <Alert variant="destructive" className="w-[50%]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка доступа</AlertTitle>
          <AlertDescription>
            У вас нет прав доступа к данной команде
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-sidebar flex size-full items-center justify-center rounded-md border px-2 py-4">
      <div className="flex flex-col gap-y-4 rounded-md border p-4">
        <div className="flex flex-col items-center gap-y-1">
          <span className="text-lg font-semibold">{team?.name}</span>
          <span className="text-sm font-medium">
            {team?.members_length || 0}{" "}
            {declension(team?.members_length || 0, [
              "участник",
              "участника",
              "участников",
            ])}
          </span>
          <span className="text-sm">
            Вы можете присоединиться к данной команде
          </span>
        </div>
        <Button onClick={handleJoin}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Присоединиться</span>
          )}
        </Button>
      </div>
    </div>
  );
}

export { TeamJoin };
