import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import { FolderX, Plus } from "lucide-react";
import { useTeamSettingsStore } from "@/app/store/team";
import { getProjectsQueryKey, useGetProjects, useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { MEMBER_ROLES } from "@/shared/constants/teams";
import { useEffect, useMemo, useState } from "react";
import { replacePathParams } from "@/app/lib/utils";
import { ROUTES } from "@/shared/constants/router";
import { Link, matchPath, useLocation } from "react-router";
import { socket } from "@/app/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectCreateDialog } from "@/features/projects";

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

  const queryClient = useQueryClient();

  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    socket.on("projects_list_invalidation", () => {
      queryClient
        .invalidateQueries({
          queryKey: getProjectsQueryKey({ team_id: String(activeTeamId) }),
        })
        .then();
    });

    return () => {
      socket.off("projects_list_invalidation");
    };
  }, []);

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
    <SidebarGroup className="flex h-full max-h-full min-h-0 flex-col">
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
      <SidebarGroupContent className="scroll overflow-y-auto">
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
            <SidebarMenuItem
              key={item.id}
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
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

      <ProjectCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarGroup>
  );
}

export { ProjectsGroup };
