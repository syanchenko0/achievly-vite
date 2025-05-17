import { createBrowserRouter } from "react-router";
import { Layout } from "@/widgets/layout";
import { ROUTES } from "@/app/constants/router";
import { lazy, Suspense } from "react";
import { Loader } from "@/shared/ui/loader";
import { RequireAuth } from "@/features/require-auth";

const AuthPage = lazy(() => import("@/pages/auth"));
const HomePage = lazy(() => import("@/pages/home"));
const TeamsSettingsPage = lazy(() => import("@/pages/teams-settings"));
// @ts-ignore
const JoinTeamPage = lazy(() =>
  import("@/pages/join-team").then((result) => result.JoinTeamPage),
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
          <Suspense fallback={<Loader />}>
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.teams_settings,
        element: (
          <Suspense fallback={<Loader />}>
            <RequireAuth>
              <TeamsSettingsPage />
            </RequireAuth>
          </Suspense>
        ),
      },
      {
        path: ROUTES.join_team,
        element: (
          <Suspense fallback={<Loader />}>
            <RequireAuth>
              <JoinTeamPage />
            </RequireAuth>
          </Suspense>
        ),
      },
    ],
  },
]);

export { router };
