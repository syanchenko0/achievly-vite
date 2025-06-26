import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronsUpDown, Plus, Settings, User, Users } from "lucide-react";
import { useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMemo, useState } from "react";
import { useTeamSettingsStore } from "@/app/store/team";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { replacePathParams } from "@/app/lib/utils";
import { TeamCreateDialog } from "@/features/teams/ui/team-create-dialog";
import { useIsMobile } from "@/shared/hooks/use-mobile";

function TeamSwitcher() {
  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const setActiveTeamId = useTeamSettingsStore(
    (store) => store.setActiveTeamId,
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const { data: teams, isLoading } = useGetTeams();

  const navigate = useNavigate();

  const { isMobile } = useIsMobile();

  const { setOpenMobile } = useSidebar();

  const activeTeam = useMemo(
    () => teams?.find((team) => team.id === Number(activeTeamId)),
    [activeTeamId, teams],
  );

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleSwitchTeam = (teamId: number) => {
    setActiveTeamId(String(teamId));
  };

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeTeam && (
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Users size={20} />
                </div>
              )}

              <div className="flex flex-col text-left text-sm">
                <span className="truncate font-semibold">
                  {activeTeam ? activeTeam.name : "Без команды"}
                </span>

                {!activeTeam && (teams?.length || 0) > 0 && (
                  <span className="text-xs font-medium">
                    Не выбрана команда
                  </span>
                )}

                {!teams?.length && (
                  <span className="text-xs font-medium">Нет команд</span>
                )}
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground flex items-center justify-between text-xs">
              Команды
            </DropdownMenuLabel>

            <div className="scroll flex max-h-64 flex-col gap-y-1">
              {teams?.map((team) => (
                <div key={team.id} className="flex items-center gap-x-1">
                  <DropdownMenuItem
                    className="w-full gap-2 p-2"
                    onClick={() => handleSwitchTeam(team.id)}
                    aria-selected={team.id === Number(activeTeamId)}
                  >
                    <User />
                    <span>{team.name}</span>
                  </DropdownMenuItem>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                      navigate(
                        replacePathParams(ROUTES.team_settings, {
                          team_id: team.id,
                        }),
                      );
                      setDropdownOpen(false);
                    }}
                  >
                    <Settings />
                  </Button>
                </div>
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

      <TeamCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarMenu>
  );
}

export { TeamSwitcher };
