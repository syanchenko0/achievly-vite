import { useGetProfile, useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { Accordion } from "@/shared/ui/accordion";
import { Team } from "@/pages/teams-settings/ui/team";

function TeamsSettings() {
  const { data: teams, isLoading: teamsLoading } = useGetTeams();

  const { data: profile, isLoading: profileLoading } = useGetProfile();

  if (teamsLoading || profileLoading) {
    return <Skeleton className="h-full" />;
  }

  return (
    <div className="bg-sidebar flex h-full rounded-md border px-2 py-4">
      <div className="scroll flex size-full flex-col gap-y-4 overflow-y-auto p-2 pl-4">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col gap-y-4"
        >
          {teams?.map((team) => (
            <Team key={team.id} team={team} profileId={profile?.id} />
          ))}
        </Accordion>
      </div>
    </div>
  );
}

export default TeamsSettings;
