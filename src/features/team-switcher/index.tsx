import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronsUpDown, Plus, User, Users } from "lucide-react";
import { useGetTeamsByUserId } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMemo, useState } from "react";
import { TeamSwitcherDialog } from "@/features/team-switcher/ui/team-switcher-dialog";
import { useTeamSettingsStore } from "@/app/store/team";

function TeamSwitcher() {
  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const setActiveTeamId = useTeamSettingsStore(
    (store) => store.setActiveTeamId,
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { data: teams, isLoading } = useGetTeamsByUserId();

  const activeTeam = useMemo(
    () =>
      activeTeamId !== null
        ? teams?.find((team) => team.id === Number(activeTeamId))
        : teams?.[0],
    [activeTeamId, teams],
  );

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleSwitchTeam = (teamId: number) => {
    setActiveTeamId(String(teamId));
  };

  if (isLoading) {
    return <Skeleton className="w-full h-12" />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeTeam ? (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Users size={20} />
                  </div>
                  <div className="text-left text-sm">
                    <span className="truncate font-semibold">
                      {activeTeam.name}
                    </span>
                  </div>
                </>
              ) : (
                <div>Его нет</div>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side="right"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Команды
            </DropdownMenuLabel>

            <div className="flex flex-col gap-y-1">
              {teams?.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  className="gap-2 p-2"
                  onClick={() => handleSwitchTeam(team.id)}
                  aria-selected={team.id === Number(activeTeamId)}
                >
                  <User />
                  <span>{team.name}</span>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2" onClick={handleOpenDialog}>
              <Plus className="size-4" />
              <span>Добавить команду</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <TeamSwitcherDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarMenu>
  );
}

export { TeamSwitcher };
