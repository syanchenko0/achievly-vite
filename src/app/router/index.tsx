import { createBrowserRouter } from "react-router";
import { Layout } from "@/widgets/layout";
import { ROUTES } from "@/app/constants/router";
import { lazy, Suspense } from "react";
import { Loader } from "@/shared/ui/loader";
import { RequireAuth } from "@/features/require-auth";

const AuthPage = lazy(() => import("@/pages/auth"));
const HomePage = lazy(() => import("@/pages/home"));

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
    ],
  },
]);

export { router };
