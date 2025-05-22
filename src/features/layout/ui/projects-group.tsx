import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { FolderX } from "lucide-react";
import { useTeamSettingsStore } from "@/app/store/team";
import { useGetProjects, useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { MEMBER_ROLES } from "@/shared/constants/teams";
import { useMemo } from "react";
import { replacePathParams } from "@/app/lib/utils";
import { ROUTES } from "@/shared/constants/router";
import { Link, matchPath, useLocation } from "react-router";
import { ProjectsGroupDialog } from "@/features/layout/ui/projects-group-dialog";

function ProjectsGroup() {
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

  const items: { label: string; link: string }[] = useMemo(() => {
    const availableProjects = projects?.filter((project) =>
      currentTeam?.user_projects_rights?.some(
        (right) => right.project_id === project.id && right.read,
      ),
    );

    return (availableProjects || []).map((project) => ({
      label: project.name,
      link: replacePathParams(ROUTES.project, {
        project_id: String(project.id),
      }),
    }));
  }, [currentTeam?.user_projects_rights, projects]);

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
      {isOwner && <ProjectsGroupDialog team_id={activeTeamId} />}
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
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={!!matchPath(item.link, pathname)}
                className="cursor-pointer"
              >
                <Link to={item.link} className="w-full">
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export { ProjectsGroup };
