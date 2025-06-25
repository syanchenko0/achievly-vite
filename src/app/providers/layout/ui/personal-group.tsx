import { Link, matchPath, useLocation } from "react-router";
import { CalendarRange, ChevronRight, Goal } from "lucide-react";
import { ROUTES } from "@/shared/constants/router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";

function PersonalGroup() {
  const { pathname } = useLocation();

  const { isMobile, setOpenMobile } = useSidebar();

  const items = [
    {
      title: "Цели",
      icon: Goal,
      items: [
        { label: "Список задач", link: ROUTES.goals_tasks },
        { label: "Список целей", link: ROUTES.goals_list },
        {
          label: "Статистика",
          link: ROUTES.goals_statistics,
        },
      ],
    },
    {
      title: "Календарь",
      icon: CalendarRange,
      link: ROUTES.events_calendar,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Личное</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!item?.items) {
            return (
              <SidebarMenuItem
                key={item.title}
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <Link to={item.link} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={!!matchPath(item.link, pathname)}
                    className="cursor-pointer"
                  >
                    {item.icon && <item.icon />}
                    <span className="w-full">{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen
              asChild
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="cursor-pointer"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.label}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <SidebarMenuSubButton
                          asChild
                          isActive={!!matchPath(subItem.link, pathname)}
                        >
                          <Link to={subItem.link} className="w-full">
                            {subItem.label}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export { PersonalGroup };
