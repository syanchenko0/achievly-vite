import { type TeamDto } from "@/shared/api";
import { useMemo } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { MEMBER_ROLES_LABELS } from "@/shared/constants/teams";
import { ActionsCell } from "@/pages/teams/ui/table-columns";

type TableData = {
  id: number;
  role: string;
  username: string;
};

const useTableData = (team: TeamDto) => {
  const data: TableData[] = useMemo(
    () =>
      team.members.map((member) => ({
        id: member.id,
        role: member.role,
        username: member.user.username,
      })),
    [team.members],
  );

  const columns: ColumnDef<TableData>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: "Роль",
        cell: ({ row }) => (
          <div>
            {
              MEMBER_ROLES_LABELS[
                row.getValue("role") as keyof typeof MEMBER_ROLES_LABELS
              ]
            }
          </div>
        ),
      },
      {
        accessorKey: "username",
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-x-1">
              <span>Имя пользователя</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                <ArrowUpDown />
              </Button>
            </div>
          );
        },
        cell: ({ row }) => <div>{row.getValue("username")}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <ActionsCell
            member_id={row.original.id}
            team_id={team.id}
            member_role={row.original.role}
            user_role={team.user_role}
          />
        ),
      },
    ],
    [team.id, team.user_role],
  );

  return {
    data,
    columns,
  };
};

export { useTableData };
export type { TableData };
