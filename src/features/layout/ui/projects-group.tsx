import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { FolderX, Plus } from "lucide-react";
import { useTeamSettingsStore } from "@/app/store/team";
import { useGetProjects, useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { MEMBER_ROLES } from "@/shared/constants/teams";
import { useMemo, useState } from "react";
import { replacePathParams } from "@/app/lib/utils";
import { ROUTES } from "@/shared/constants/router";
import { Link, matchPath, useLocation } from "react-router";
import { ProjectsGroupDialog } from "@/features/layout/ui/projects-group-dialog";

function ProjectsGroup() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { pathname } = useLocation();

  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const { data: teams, isLoading: teamsLoading } = useGetTeams();

  const { data: projects, isLoading: projectsLoading } = useGetProjects(
    {
      params: {
        team_id: activeTeamId as string,
      },
    },
    {
      query: { enabled: !!activeTeamId && !!teams?.length },
    },
  );

  const currentTeam = useMemo(
    () => teams?.find((team) => team.id === Number(activeTeamId)),
    [activeTeamId, teams],
  );

  const items = useMemo(() => {
    return (projects || []).map((project) => ({
      id: project.id,
      label: project.name,
      link: replacePathParams(ROUTES.project, {
        project_id: String(project.id),
      }),
    }));
  }, [projects]);

  const isOwner = currentTeam?.user_role === MEMBER_ROLES.owner;

  if (projectsLoading || teamsLoading) {
    return (
      <div className="p-4">
        <Skeleton className="min-h-8 w-full" />
      </div>
    );
  }

  if (!activeTeamId || !teams?.length) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Проекты</SidebarGroupLabel>
      {isOwner && (
        <SidebarGroupAction
          title="Добавить проект"
          className="cursor-pointer rounded-sm"
          onClick={() => setDialogOpen(true)}
        >
          <Plus />
          <span className="sr-only">Добавить проект</span>
        </SidebarGroupAction>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {!items.length && (
            <div className="flex items-center gap-2 pl-2 text-neutral-300 [&>svg]:size-[18px]">
              <FolderX />
              <span className="text-xs font-medium">
                У вас пока нет проектов
              </span>
            </div>
          )}
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={!!matchPath(item.link, pathname)}
                className="cursor-pointer p-0"
              >
                <Link to={item.link} className="w-full p-2">
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <ProjectsGroupDialog
        team_id={activeTeamId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </SidebarGroup>
  );
}

export { ProjectsGroup };
