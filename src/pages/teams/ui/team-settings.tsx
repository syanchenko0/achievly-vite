import { useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Files,
  Loader as LoaderIcon,
  LogOut,
  Trash2,
  Users,
  UserX,
} from "lucide-react";
import {
  type TeamDto,
  useDeleteTeam as useDeleteTeamQuery,
  useDeleteTeamMembers,
  useGetProfile,
  useGetTeam,
  useLeaveFromTeam,
} from "@/shared/api";
import { cn, declension } from "@/app/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { MEMBER_ROLES, MEMBER_ROLES_LABELS } from "@/shared/constants/teams";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useCopyLink } from "@/pages/teams/hooks/use-copy-link";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { useState } from "react";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useTableData } from "@/pages/teams/hooks/use-table-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Skeleton } from "@/shared/ui/skeleton";

function TeamSettings() {
  const { team_id } = useParams<{ team_id: string }>();

  const {
    data: team,
    isLoading: teamLoading,
    error: teamError,
  } = useGetTeam(
    { team_id: team_id as string },
    { query: { enabled: !!team_id } },
  );

  if (teamLoading) {
    return (
      <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
        <Skeleton className="min-h-[100px] w-full" />
        <Skeleton className="size-full" />
      </div>
    );
  }

  if (!team || teamError) {
    return (
      <div className="bg-sidebar size-full rounded-md border p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            {teamError?.response?.data?.message || "Команда не найдена"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between rounded-md border p-4">
        <div className="flex gap-x-3">
          <div className="flex size-16 items-center justify-center rounded-md bg-blue-600 p-3">
            <Users />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{team.name}</span>
            <span className="text-sm font-medium">
              {team.members.length}{" "}
              {declension(team.members.length, [
                "участник",
                "участника",
                "участников",
              ])}
            </span>
            <Badge className="mt-1">
              {
                MEMBER_ROLES_LABELS[
                  team.user_role as keyof typeof MEMBER_ROLES_LABELS
                ]
              }
            </Badge>
          </div>
        </div>

        <TeamControls team_id={String(team.id)} user_role={team.user_role} />
      </div>

      <div className="rounded-md border px-4">
        <UsersTable team={team} />
      </div>
    </div>
  );
}

function TeamControls({
  team_id,
  user_role,
}: {
  team_id: string;
  user_role: string;
}) {
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);

  const { mutateAsync: deleteTeam } = useDeleteTeamQuery();

  const { mutateAsync: leaveFromTeam } = useLeaveFromTeam();

  const { handleCopyLink, handleResetCopied, copyLoading, copied } =
    useCopyLink(team_id);

  const handleDeleteTeam = async () => {
    if (team_id) await deleteTeam({ team_id });
  };

  const handleLeaveTeam = async () => {
    if (team_id) await leaveFromTeam({ team_id });
  };

  const isOwner = user_role === MEMBER_ROLES.owner;

  if (!isOwner)
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => setAlertDialogOpen(true)}
              >
                <LogOut />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Выйти из команды</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Выйти из команды</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите покинуть команду?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отменить</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveTeam}>
                Подтвердить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );

  return (
    <div className="flex gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={handleCopyLink}
              onMouseLeave={handleResetCopied}
            >
              <LoaderIcon
                className={cn("absolute opacity-0 transition-opacity", {
                  ["animate-spin opacity-100"]: copyLoading,
                })}
              />
              <Check
                className={cn("absolute opacity-0 transition-opacity", {
                  ["opacity-100"]: copied,
                })}
              />
              <Files
                className={cn("absolute opacity-100 transition-opacity", {
                  ["opacity-0"]: copied,
                })}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Скопировать ссылку-приглашение в команду
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => setAlertDialogOpen(true)}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Удалить команду</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить команду</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить команду?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отменить</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam}>
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UsersTable({ team }: { team: TeamDto }) {
  const { data: profile } = useGetProfile();

  const { data, columns } = useTableData(team, profile?.id);

  const { mutateAsync: deleteMembers, isPending: deleteMembersLoading } =
    useDeleteTeamMembers();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: (row) => row.original.role !== MEMBER_ROLES.owner,
    getRowId: (row) => String(row.id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleDeleteMembers = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((row) => row.original.id);

    await deleteMembers({
      team_id: String(team.id),
      data: { member_ids: ids },
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Фильтровать по имени пользователя"
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center font-medium"
                >
                  {table.getColumn("username")?.getFilterValue()
                    ? "Нет результатов поиска"
                    : "Отсутствуют пользователи в команде"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className={cn("opacity-0 transition-opacity", {
                  ["opacity-100"]:
                    table.getFilteredSelectedRowModel().rows.length > 0,
                })}
                disabled={deleteMembersLoading}
              >
                {deleteMembersLoading ? (
                  <LoaderIcon className="animate-spin" />
                ) : (
                  <>
                    <UserX />
                    <span>Исключить выделенных участников</span>
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтвердите действие</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите исключить выделенных участников?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отменить</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMembers}>
                  Подтвердить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="mr-4 flex items-center justify-center text-sm font-medium">
          Страница {table.getState().pagination.pageIndex + 1} из{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { TeamSettings };
