import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronsUpDown, Loader2, LogOut } from "lucide-react";
import { useGetProfile, useLogout } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useIsMobile } from "@/shared/hooks/use-mobile";

function UserDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const { data: profile, isLoading: profileLoading } = useGetProfile();

  const { isMobile } = useIsMobile();

  const { mutate: logout, isPending: logoutPending } = useLogout({
    mutation: {
      onSuccess: () => {
        setDropdownOpen(false);
        window.location.reload();
      },
    },
  });

  if (profileLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (!profile) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar>
                <AvatarImage src={profile.picture_url} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <div className="flex max-w-[135px] flex-col text-left">
                <span className="truncate text-xs font-medium">
                  {profile.username}
                </span>
                <span className="truncate text-xs font-medium">
                  {profile.email}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto min-w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="end"
            side={isMobile ? "top" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex flex-col text-left">
                <span className="truncate text-xs font-medium">
                  {profile.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => logout()} disabled={logoutPending}>
              {logoutPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <LogOut className="size-4" />
                  <span>Выйти из аккаунта</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { UserDropdown };
