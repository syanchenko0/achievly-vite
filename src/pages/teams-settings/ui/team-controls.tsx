import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Check, Files, Loader, Trash2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useCopyLink } from "@/pages/teams-settings/hooks/use-copy-link";
import type { MemberDto, TeamDto } from "@/shared/api";
import { MEMBER_ROLES } from "@/pages/teams-settings/constants";

function TeamControls({
  team,
  currentMember,
}: {
  team: TeamDto;
  currentMember: MemberDto | undefined;
}) {
  const { handleCopyLink, handleResetCopied, copyLoading, copied } =
    useCopyLink(team);

  const isOwner = currentMember?.role === MEMBER_ROLES.owner;

  return (
    isOwner && (
      <div className="flex items-center justify-end gap-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleCopyLink}
                onMouseLeave={handleResetCopied}
              >
                <Loader
                  className={cn("absolute opacity-0 transition-opacity", {
                    ["animate-spin opacity-100"]: copyLoading,
                  })}
                />
                <Check
                  className={cn("absolute opacity-0 transition-opacity", {
                    ["opacity-100"]: copied,
                  })}
                />
                <Files
                  className={cn("absolute opacity-100 transition-opacity", {
                    ["opacity-0"]: copied,
                  })}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <span>Скопировать ссылку-приглашение в команду</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleCopyLink}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Удалить команду</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  );
}

export { TeamControls };
