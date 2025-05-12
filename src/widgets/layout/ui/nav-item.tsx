import { NavLink, useMatch } from "react-router";
import { SidebarMenuButton, SidebarMenuItem } from "@/shared/ui/sidebar";
import type { LucideIcon } from "lucide-react";

type LayoutNavItemProps = {
  label: string;
  link: string;
  icon?: LucideIcon;
};

function LayoutNavItem({ label, link, icon: Icon }: LayoutNavItemProps) {
  const match = useMatch(link);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <NavLink to={link}>
          {Icon && <Icon />}
          {label}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export { LayoutNavItem };
