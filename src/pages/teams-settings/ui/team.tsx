import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { declension } from "@/app/lib/utils";
import { Member } from "@/pages/teams-settings/ui/member";
import { type TeamDto } from "@/shared/api";
import { useMemo } from "react";
import { TeamControls } from "@/pages/teams-settings/ui/team-controls";

function Team({ team, profileId }: { team: TeamDto; profileId?: number }) {
  const currentMember = useMemo(
    () => team?.members?.find((member) => member.user.id === profileId),
    [profileId, team?.members],
  );

  return (
    <AccordionItem
      value={String(team.id)}
      className="rounded-md border px-4 last:border"
    >
      <AccordionTrigger className="cursor-pointer items-center">
        <div className="flex items-center gap-x-2">
          <span>{team.name}</span>
          <div className="bg-foreground size-1 rounded-full" />
          <span>
            {team.members.length}{" "}
            {declension(team.members.length, [
              "участник",
              "участника",
              "участников",
            ])}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <span className="font-medium">Участники:</span>

          <div className="flex flex-col gap-y-2 rounded-md border p-2">
            {team.members.map((member) => (
              <Member
                key={member.user.id}
                member={member}
                currentMember={currentMember}
              />
            ))}
          </div>
        </div>

        <TeamControls team={team} currentMember={currentMember} />
      </AccordionContent>
    </AccordionItem>
  );
}

export { Team };
