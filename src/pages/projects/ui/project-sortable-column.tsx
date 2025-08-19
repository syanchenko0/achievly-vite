import type { ProjectColumn } from "@/shared/api";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { ForbiddenEditAlertDialog } from "@/pages/projects/ui/forbidden-edit-alert-dialog";
import { ForbiddenCreateAlertDialog } from "@/pages/projects/ui/forbidden-create-alert-dialog";

function ProjectSortableColumn({
  index,
  children,
  column,
  onOpenColumnEditDialog,
}: {
  index: number;
  column: ProjectColumn;
  children: React.ReactNode;
  onOpenColumnEditDialog: () => void;
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
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });

  const { deleteProjectColumn } = useProjectQueries();

  return (
    <div
      className="flex min-w-8/12 flex-1 flex-col items-center gap-2 md:min-w-1/4"
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
                      onOpenColumnEditDialog();
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

        {children}
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

      <AlertDialog
        open={openDeleteAlertDialog}
        onOpenChange={setOpenDeleteAlertDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {column?.is_removable && project?.user_project_rights?.delete
                ? "Подтвердите действие"
                : "Недостаточно прав"}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col">
              {!project?.user_project_rights?.delete && (
                <span>
                  У вас нет прав на удаление данных в проекте.
                  <br />
                  Запросите доступ у создателя проекта
                </span>
              )}
              {!column?.is_removable &&
                project?.user_project_rights?.delete && (
                  <span>
                    Данный столбец нельзя удалить из-за его настроек. <br />
                    Вы можете изменить настройки столбца, если у вас есть права
                    на редактирование. <br />В ином случае, обратитесь к
                    создателю проекта
                  </span>
                )}
              {column?.is_removable && project?.user_project_rights?.delete && (
                <span>Вы уверены, что хотите удалить столбец?</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Закрыть</AlertDialogCancel>
            {column?.is_removable && project?.user_project_rights?.delete && (
              <AlertDialogAction
                onClick={() => {
                  if (project)
                    deleteProjectColumn({
                      project_id: project.id,
                      column_id: column.id,
                    });
                }}
              >
                Подтвердить
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { ProjectSortableColumn };
