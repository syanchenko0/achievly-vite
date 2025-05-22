import { matchPath, useLocation } from "react-router";
import { ROUTE_LABELS, ROUTES } from "@/shared/constants/router";

const useRouteLabel = () => {
  const { pathname } = useLocation();

  const route = Object.values(ROUTES).find((route) => {
    return matchPath(route, pathname);
  });

  return { label: ROUTE_LABELS[route as keyof typeof ROUTE_LABELS] };
};

export { useRouteLabel };
