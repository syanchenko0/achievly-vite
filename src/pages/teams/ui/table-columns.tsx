import { useDeleteTeamMember } from "@/shared/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Settings, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useState } from "react";
import { MEMBER_ROLES } from "@/shared/constants/teams";

const ActionsCell = ({
  member_id,
  team_id,
  member_role,
  user_role,
}: {
  member_id: number;
  team_id: number;
  member_role: string;
  user_role: string;
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { mutateAsync: deleteTeamMember } = useDeleteTeamMember();

  const isMemberOwner = member_role === MEMBER_ROLES.owner;

  const isUserAdmin = user_role === MEMBER_ROLES.admin;

  const isUserMember = user_role === MEMBER_ROLES.member;

  const handleDeleteTeamMember = async () => {
    await deleteTeamMember({
      member_id: String(member_id),
      team_id: String(team_id),
    });
  };

  if (isMemberOwner || isUserMember) return null;

  return (
    <div className="flex justify-end gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={() => setOpenDialog(true)}>
              <Settings />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Редактировать права</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isUserAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleDeleteTeamMember}
              >
                <UserX />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Исключить из команды</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ActionsCell };
