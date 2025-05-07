import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import {
  Link,
  matchPath,
  NavLink,
  Outlet,
  useLocation,
  useMatch,
} from "react-router";
import {
  CalendarRange,
  ChevronRight,
  ChevronsUpDown,
  FolderX,
  Goal,
  type LucideIcon,
  Plus,
  User,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/app/constants/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";

type LayoutNavItemProps = {
  label: string;
  link: string;
  icon?: LucideIcon;
};

function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Team name</span>
                <span className="truncate text-xs">team plan</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={"right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Команды
            </DropdownMenuLabel>

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <User />
              </div>
              test
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

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

function ProjectsGroup() {
  const items: { label: string; link: string }[] = [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Проекты</SidebarGroupLabel>
      <SidebarGroupAction
        title="Добавить проект"
        className="cursor-pointer rounded-sm"
      >
        <Plus />
        <span className="sr-only">Добавить проект</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {!items.length && (
            <div className="flex gap-2 [&>svg]:size-[18px] pl-2 items-center text-neutral-300">
              <FolderX />
              <span className="text-xs font-medium">
                У вас пока нет проектов
              </span>
            </div>
          )}
          {items.map((item, index) => (
            <LayoutNavItem key={index} {...item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function PersonalGroup() {
  const { pathname } = useLocation();

  const items = [
    {
      title: "Цели",
      icon: Goal,
      items: [
        { label: "Список", link: ROUTES.goals_list },
        {
          label: "Статистика",
          link: ROUTES.goals_statistics,
        },
      ],
    },
    {
      title: "Календарь",
      icon: CalendarRange,
      link: ROUTES.calendar,
    },
    {
      title: "Бюджет",
      icon: Wallet,
      items: [{ label: "Учет", link: ROUTES.budget_records }],
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Личное</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!item?.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={!!matchPath(item.link, pathname)}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <Link to={item.link}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible key={item.title} asChild className="group/collapsible">
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
                      <SidebarMenuSubItem key={subItem.label}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={!!matchPath(subItem.link, pathname)}
                        >
                          <Link to={subItem.link}>{subItem.label}</Link>
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

function Layout() {
  return (
    <SidebarProvider>
      <Sidebar variant="floating">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <PersonalGroup />
          <ProjectsGroup />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="h-svh max-h-svh p-2 pr-2 gap-y-4">
        <header className="flex sticky top-0 bg-sidebar h-14 shrink-0 mr-1 items-center rounded-md gap-2 border px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 max-h-4" />
        </header>
        <div className="flex-1 overflow-y-auto pr-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { Layout };
