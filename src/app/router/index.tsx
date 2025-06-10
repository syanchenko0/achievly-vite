import { createBrowserRouter } from "react-router";
import { Layout } from "@/features/layout";
import { ROUTES } from "@/shared/constants/router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/shared/ui/require-auth";
import { PageLoader } from "@/shared/ui/page-loader";
import { AuthLoader } from "@/shared/ui/auth-loader";

const AuthPage = lazy(() =>
  import("@/pages/auth").then((module) => ({
    default: module.Auth,
  })),
);
const HomePage = lazy(() =>
  import("@/pages/home").then((module) => ({
    default: module.Home,
  })),
);
const TeamJoinPage = lazy(() =>
  import("@/pages/teams").then((module) => ({
    default: module.TeamJoin,
  })),
);
const TeamSettingsPage = lazy(() =>
  import("@/pages/teams").then((module) => ({
    default: module.TeamSettings,
  })),
);
const GoalsTasksPage = lazy(() =>
  import("@/pages/goals").then((module) => ({
    default: module.GoalsTasks,
  })),
);
const GoalsListPage = lazy(() =>
  import("@/pages/goals").then((module) => ({
    default: module.GoalsList,
  })),
);
const GoalsStatisticsPage = lazy(() =>
  import("@/pages/goals").then((module) => ({
    default: module.GoalsStatistics,
  })),
);
const EventsCalendarPage = lazy(() =>
  import("@/pages/events").then((module) => ({
    default: module.EventsCalendar,
  })),
);
const ProjectPage = lazy(() =>
  import("@/pages/projects").then((module) => ({
    default: module.Project,
  })),
);

const router = createBrowserRouter([
  {
    path: ROUTES.auth,
    element: (
      <Suspense fallback={<AuthLoader />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    element: <Layout />,
    children: [
      {
        path: ROUTES.home,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          </Suspense>
        ),
      },

      {
        path: ROUTES.team_join,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <TeamJoinPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.team_settings,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <TeamSettingsPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.goals_tasks,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <GoalsTasksPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.goals_list,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <GoalsListPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.goals_statistics,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <GoalsStatisticsPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.events_calendar,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <EventsCalendarPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.project,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <ProjectPage />
            </RequireAuth>
          </Suspense>
        ),
      },
    ],
  },
]);

export { router };
