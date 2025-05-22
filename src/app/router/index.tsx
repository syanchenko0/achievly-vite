import { createBrowserRouter } from "react-router";
import { Layout } from "@/features/layout";
import { ROUTES } from "@/shared/constants/router";
import { lazy, Suspense } from "react";
import { Loader } from "@/shared/ui/loader";
import { RequireAuth } from "@/shared/ui/require-auth";
import { PageLoader } from "@/shared/ui/page-loader";

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
const GoalsBoardPage = lazy(() =>
  import("@/pages/goals").then((module) => ({
    default: module.GoalsBoard,
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

const router = createBrowserRouter([
  {
    path: ROUTES.auth,
    element: (
      <Suspense fallback={<Loader />}>
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
        path: ROUTES.goals_board,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RequireAuth>
              <GoalsBoardPage />
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
    ],
  },
]);

export { router };
