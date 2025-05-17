import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { Outlet, useLocation } from "react-router";
import { TeamSwitcher } from "@/features/team-switcher";
import { PersonalGroup } from "@/widgets/layout/ui/personal-group";
import { ProjectsGroup } from "@/widgets/layout/ui/projects-group";
import { RequireAuth } from "@/features/require-auth";
import { ROUTE_LABELS } from "@/app/constants/router";

function Layout() {
  const { pathname } = useLocation();

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
        <SidebarInset className="h-svh max-h-svh gap-y-4 p-2 pr-2">
          <header className="bg-sidebar sticky top-0 mr-1 flex h-14 shrink-0 items-center gap-2 rounded-md border px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 max-h-4" />
            <span className="text-foreground text-sm font-medium">
              {ROUTE_LABELS[pathname]}
            </span>
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
