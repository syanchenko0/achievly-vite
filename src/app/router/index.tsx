import { createBrowserRouter } from "react-router";
import { Layout } from "@/shared/ui/layout";
import { ROUTES } from "@/app/constants/router";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: ROUTES.home,
        element: <div>Home</div>,
      },
    ],
  },
]);

export { router };
