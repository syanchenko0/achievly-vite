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
import { RequireAuth } from "@/shared/ui/require-auth";
import { TeamSwitcher } from "@/features/layout/ui/team-switcher";
import { PersonalGroup } from "@/features/layout/ui/personal-group";
import { ProjectsGroup } from "@/features/layout/ui/projects-group";
import { useRouteLabel } from "@/features/layout/hooks/use-route-label";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { GoalCreateSheet } from "@/widgets/goals/ui/goal-create-sheet";

function Layout() {
  const [openCreateGoalSheet, setOpenCreateGoalSheet] =
    useState<boolean>(false);

  const { label } = useRouteLabel();

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
          <header className="bg-sidebar sticky top-0 mr-1 flex h-14 items-center justify-between gap-2 rounded-md border px-4">
            <div className="flex shrink-0 items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 max-h-4" />
              <span className="text-foreground text-sm font-medium">
                {label}
              </span>
            </div>
            <Button onClick={() => setOpenCreateGoalSheet(true)}>
              <Plus />
              Создать цель
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </div>
        </SidebarInset>

        <GoalCreateSheet
          open={openCreateGoalSheet}
          onOpenChange={setOpenCreateGoalSheet}
        />
      </SidebarProvider>
    </RequireAuth>
  );
}

export { Layout };
