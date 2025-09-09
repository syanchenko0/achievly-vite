import type { ProjectColumn } from "@/shared/api";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ProjectTaskCreateDialog } from "@/pages/projects/ui/project-task-create-dialog";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";

import { ForbiddenEditAlertDialog } from "@/pages/projects/ui/forbidden-edit-alert-dialog";
import { ForbiddenCreateAlertDialog } from "@/pages/projects/ui/forbidden-create-alert-dialog";
import { DeleteColumnAlertDialog } from "@/pages/projects/ui/delete-column-alert-dialog";

function ProjectSortableColumn({
  index,
  column,
  onOpenColumnEditDialog,
}: {
  index: number;
  column: ProjectColumn;
  onOpenColumnEditDialog: (column: ProjectColumn) => void;
}) {
  const [openCreateTaskDialog, setOpenCreateTaskDialog] =
    useState<boolean>(false);
  const [openForbiddenCreateAlertDialog, setOpenForbiddenCreateAlertDialog] =
    useState<boolean>(false);
  const [openForbiddenEditAlertDialog, setOpenForbiddenEditAlertDialog] =
    useState<boolean>(false);
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] =
    useState<boolean>(false);

  const { project } = useProjectQueries();

  const { ref } = useSortable({
    id: column.id,
    index,
  });

  const { deleteProjectColumn } = useProjectQueries();

  return (
    <div
      className="flex min-w-8/12 flex-1 flex-col items-center gap-2 md:min-w-1/5"
      ref={ref}
    >
      <div className="flex size-full flex-col gap-y-4">
        <div className="bg-sidebar flex cursor-pointer items-center justify-between rounded-md border px-4 py-2">
          <h3 className="text-base font-medium">{column.name}</h3>
          <div className="flex items-center">
            {column.is_task_creation_allowed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (!project?.user_project_rights?.create) {
                        setOpenForbiddenCreateAlertDialog(true);
                      } else {
                        setOpenCreateTaskDialog(true);
                      }
                    }}
                  >
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Добавить задачу</TooltipContent>
              </Tooltip>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    if (!project?.user_project_rights?.update) {
                      setOpenForbiddenEditAlertDialog(true);
                    } else {
                      onOpenColumnEditDialog(column);
                    }
                  }}
                >
                  <Pencil />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setOpenDeleteAlertDialog(true);
                  }}
                >
                  <Trash2 />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {column.is_task_creation_allowed && (
        <ProjectTaskCreateDialog
          open={openCreateTaskDialog}
          column={column}
          onOpenChange={setOpenCreateTaskDialog}
        />
      )}

      <ForbiddenCreateAlertDialog
        open={openForbiddenCreateAlertDialog}
        onOpenChange={setOpenForbiddenCreateAlertDialog}
      />

      <ForbiddenEditAlertDialog
        open={openForbiddenEditAlertDialog}
        onOpenChange={setOpenForbiddenEditAlertDialog}
      />

      <DeleteColumnAlertDialog
        open={openDeleteAlertDialog}
        has_tasks={
          project?.project_tasks?.some(
            (task) => task?.column?.id === column?.id,
          ) ?? false
        }
        is_removable={!!column?.is_removable}
        has_rights={!!project?.user_project_rights?.delete}
        onConfirm={() => {
          if (project)
            deleteProjectColumn({
              project_id: project.id,
              column_id: column?.id,
            });
        }}
        onOpenChange={setOpenDeleteAlertDialog}
      />
    </div>
  );
}

export { ProjectSortableColumn };
