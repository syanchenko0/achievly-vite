import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { Outlet } from "react-router";
import { TeamSwitcher } from "@/features/team-switcher";
import { PersonalGroup } from "@/widgets/layout/ui/personal-group";
import { ProjectsGroup } from "@/widgets/layout/ui/projects-group";
import { RequireAuth } from "@/features/require-auth";

function Layout() {
  return (
    <RequireAuth>
      <SidebarProvider>
        <Sidebar variant="floating">
          <SidebarHeader>
            <TeamSwitcher />
          </SidebarHeader>
          <SidebarContent className="gap-0">
            <PersonalGroup />
            <ProjectsGroup />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="h-svh max-h-svh p-2 pr-2 gap-y-4">
          <header className="flex sticky top-0 bg-sidebar h-14 shrink-0 mr-1 items-center rounded-md gap-2 border px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 max-h-4" />
          </header>
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}

export { Layout };
