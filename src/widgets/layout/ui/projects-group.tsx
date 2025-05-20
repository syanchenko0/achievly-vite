import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/shared/ui/sidebar";
import { FolderX, Plus } from "lucide-react";
import { LayoutNavItem } from "@/widgets/layout/ui/nav-item";
import { useTeamSettingsStore } from "@/app/store/team";
import { useGetProjects, useGetTeams } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { MEMBER_ROLES } from "@/shared/constants/teams";
import { useMemo } from "react";
import { replacePathParams } from "@/app/lib/utils";
import { ROUTES } from "@/shared/constants/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/shared/ui/dialog";

function ProjectsGroup() {
  const activeTeamId = useTeamSettingsStore((store) => store.activeTeamId);

  const { data: teams, isLoading: teamsLoading } = useGetTeams();

  const { data: projects, isLoading: projectsLoading } = useGetProjects(
    {
      params: {
        team_id: activeTeamId as string,
      },
    },
    {
      query: { enabled: !!activeTeamId },
    },
  );

  const items: { label: string; link: string }[] = useMemo(
    () =>
      (projects || []).map((project) => ({
        label: project.name,
        link: replacePathParams(ROUTES.project, {
          project_id: String(project.id),
        }),
      })),
    [projects],
  );

  const isOwner =
    teams?.find((team) => team.id === Number(activeTeamId))?.user_role ===
    MEMBER_ROLES.owner;

  if (projectsLoading || teamsLoading) {
    return (
      <div className="p-4">
        <Skeleton className="min-h-8 w-full" />
      </div>
    );
  }

  if (!activeTeamId) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Проекты</SidebarGroupLabel>
      {isOwner && (
        <Dialog>
          <DialogTrigger asChild>
            <SidebarGroupAction
              title="Добавить проект"
              className="cursor-pointer rounded-sm"
            >
              <Plus />
              <span className="sr-only">Добавить проект</span>
            </SidebarGroupAction>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Создание проекта</DialogHeader>
            <DialogDescription>
              Заполните необходимые поля, чтобы создать проект
            </DialogDescription>

            <div></div>
          </DialogContent>
        </Dialog>
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
          {items.map((item, index) => (
            <LayoutNavItem key={index} {...item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export { ProjectsGroup };
