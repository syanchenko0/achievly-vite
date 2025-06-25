import { Link, matchPath, useLocation } from "react-router";
import { ROUTE_LABELS, ROUTES } from "@/shared/constants/router";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import { Home } from "lucide-react";

function HomeItem() {
  const { pathname } = useLocation();

  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem
      onClick={() => {
        if (isMobile) setOpenMobile(false);
      }}
    >
      <Link to={ROUTES.home} className="w-full">
        <SidebarMenuButton
          tooltip={"Главная"}
          isActive={!!matchPath(ROUTES.home, pathname)}
          className="cursor-pointer"
        >
          <Home />
          <span className="w-full">{ROUTE_LABELS[ROUTES.home]}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export { HomeItem };
