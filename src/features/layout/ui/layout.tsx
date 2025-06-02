import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";
import { matchPath, Outlet, useLocation } from "react-router";
import { RequireAuth } from "@/shared/ui/require-auth";
import { TeamSwitcher } from "@/features/layout/ui/team-switcher";
import { PersonalGroup } from "@/features/layout/ui/personal-group";
import { ProjectsGroup } from "@/features/layout/ui/projects-group";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { GoalCreateSheet } from "@/widgets/goals/ui/goal-create-sheet";
import { ROUTE_LABELS, ROUTES } from "@/shared/constants/router";
import { EventCreateDialog } from "@/widgets/events";
import { EventCreateFromTasksDialog } from "@/widgets/events/ui/event-create-from-tasks-dialog";
import { UserDropdown } from "@/features/layout/ui/user-dropdown";

function Layout() {
  const [openCreateGoalSheet, setOpenCreateGoalSheet] =
    useState<boolean>(false);
  const [openCreateEventDialog, setOpenCreateEventDialog] =
    useState<boolean>(false);
  const [openCreateEventFromTasksDialog, setOpenCreateEventFromTasksDialog] =
    useState<boolean>(false);

  const { pathname } = useLocation();

  const route = Object.values(ROUTES).find((route) => {
    return matchPath(route, pathname);
  });

  const isGoals =
    route === ROUTES.goals_board ||
    route === ROUTES.goals_list ||
    route === ROUTES.goals_statistics;

  const isEvents = route === ROUTES.events_calendar;

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
          <SidebarFooter>
            <UserDropdown />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="h-svh max-h-svh gap-y-4 p-2 pr-2">
          <header className="bg-sidebar sticky top-0 mr-1 flex h-14 items-center justify-between gap-2 rounded-md border px-4">
            <div className="flex shrink-0 items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 max-h-4" />
              <span className="text-foreground text-sm font-medium">
                {ROUTE_LABELS[route as keyof typeof ROUTE_LABELS]}
              </span>
            </div>
            {isGoals && (
              <Button onClick={() => setOpenCreateGoalSheet(true)}>
                <Plus />
                Создать цель
              </Button>
            )}

            {isEvents && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Plus />
                    Добавить событие
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setOpenCreateEventDialog(true)}
                  >
                    Создать новое событие
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOpenCreateEventFromTasksDialog(true)}
                  >
                    Добавить события из списка задач
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </div>
        </SidebarInset>

        <GoalCreateSheet
          open={openCreateGoalSheet}
          onOpenChange={setOpenCreateGoalSheet}
        />

        <EventCreateDialog
          open={openCreateEventDialog}
          onOpenChange={setOpenCreateEventDialog}
        />

        <EventCreateFromTasksDialog
          open={openCreateEventFromTasksDialog}
          onOpenChange={setOpenCreateEventFromTasksDialog}
        />
      </SidebarProvider>
    </RequireAuth>
  );
}

export { Layout };
