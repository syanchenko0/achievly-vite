import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Settings, Trash2 } from "lucide-react";
import { type MemberDto } from "@/shared/api";
import {
  MEMBER_ROLES,
  MEMBER_ROLES_LABELS,
} from "@/pages/teams-settings/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

function Member({
  member,
  currentMember,
}: {
  member: MemberDto;
  currentMember?: MemberDto;
}) {
  const isOwner = currentMember?.role === MEMBER_ROLES.owner;

  const isAdmin = currentMember?.role === MEMBER_ROLES.admin;

  const isControlsShow =
    (isOwner || isAdmin) && member.user.id !== currentMember?.user.id;

  return (
    <div className="bg-muted flex items-center justify-between gap-x-2 rounded-md p-2">
      <div className="flex items-center gap-x-2">
        <Avatar>
          <AvatarImage
            src={member.user.picture_url}
            alt={member.user.username}
          />
          <AvatarFallback>{member.user.username}</AvatarFallback>
        </Avatar>
        <span>{member.user.username}</span>
        <div className="bg-foreground size-1 rounded-full" />
        <span>
          {MEMBER_ROLES_LABELS[member.role as keyof typeof MEMBER_ROLES]}
        </span>
      </div>

      {isControlsShow && (
        <div className="flex items-center gap-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" className="size-8">
                <Settings />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактирование участника</DialogTitle>
                <DialogDescription>
                  Вы можете изменить роль и права участника
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-y-2"></div>
            </DialogContent>
          </Dialog>

          <Button size="icon" variant="destructive" className="size-8">
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

export { Member };
