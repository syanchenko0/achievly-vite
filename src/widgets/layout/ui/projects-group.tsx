import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/shared/ui/sidebar";
import { FolderX, Plus } from "lucide-react";
import { LayoutNavItem } from "@/widgets/layout/ui/nav-item";

function ProjectsGroup() {
  const items: { label: string; link: string }[] = [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Проекты</SidebarGroupLabel>
      <SidebarGroupAction
        title="Добавить проект"
        className="cursor-pointer rounded-sm"
      >
        <Plus />
        <span className="sr-only">Добавить проект</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {!items.length && (
            <div className="flex gap-2 [&>svg]:size-[18px] pl-2 items-center text-neutral-300">
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
