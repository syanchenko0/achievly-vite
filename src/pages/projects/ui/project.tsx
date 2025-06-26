import { useParams, useSearchParams } from "react-router";
import {
  getProjectQueryKey,
  type ProjectColumn,
  type ProjectTaskDto,
} from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { DragDropProvider } from "@dnd-kit/react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import { format } from "date-fns";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import { ProjectSortableTask } from "@/pages/projects/ui/project-sortable-task";
import { ProjectSortableColumn } from "@/pages/projects/ui/project-sortable-column";
import { ProjectColumnEditDialog } from "@/pages/projects/ui/project-column-edit-dialog";
import { ProjectTaskEditSheet } from "@/pages/projects/ui/project-task-edit-sheet";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { ProjectColumnCreateDialog } from "@/pages/projects/ui/project-column-create-dialog";
import { ForbiddenEditAlertDialog } from "@/pages/projects/ui/forbidden-edit-alert-dialog";
import { ForbiddenCreateAlertDialog } from "@/pages/projects/ui/forbidden-create-alert-dialog";
import { ProjectDeleteAlertDialog } from "@/pages/projects/ui/project-delete-alert-dialog";
import { ForbiddenDeleteAlertDialog } from "@/pages/projects/ui/forbidden-delete-alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/app/lib/socket";

function Project() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { project_id } = useParams<{ project_id: string }>();

  const [items, setItems] = useState<Map<ProjectColumn, ProjectTaskDto[]>>();
  const [columns, setColumns] = useState<ProjectColumn[]>([]);

  const [openColumnCreateDialog, setOpenColumnCreateDialog] =
    useState<boolean>(false);
  const [openColumnEditDialog, setOpenColumnEditDialog] =
    useState<boolean>(false);
  const [openTaskEditSheet, setOpenTaskEditSheet] = useState<boolean>(false);
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] =
    useState<boolean>(false);

  const [openForbiddenCreateAlertDialog, setOpenForbiddenCreateAlertDialog] =
    useState<boolean>(false);
  const [openForbiddenEditAlertDialog, setOpenForbiddenEditAlertDialog] =
    useState<boolean>(false);
  const [openForbiddenDeleteAlertDialog, setOpenForbiddenDeleteAlertDialog] =
    useState<boolean>(false);

  const [columnForUpdate, setColumnForUpdate] = useState<ProjectColumn>();
  const [taskForUpdate, setTaskForUpdate] = useState<ProjectTaskDto>();

  const previousItems = useRef<Map<ProjectColumn, ProjectTaskDto[]>>(items);
  const previousColumns = useRef<ProjectColumn[]>(columns);

  const {
    project,
    projectLoading,
    projectError,
    updateProject,
    updateProjectTask,
    updateProjectTaskListOrder,
  } = useProjectQueries();

  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("project_invalidation", () => {
      queryClient
        .invalidateQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        })
        .then();
    });

    return () => {
      socket.off("project_invalidation");
    };
  }, []);

  useEffect(() => {
    if (project) {
      const newItems = new Map(
        project?.columns.map((column) => [
          column,
          (project.project_tasks ?? []).filter(
            (task) => task.column.id === column.id,
          ),
        ]) ?? [],
      );

      setItems(newItems);
      setColumns(Array.from(newItems.keys()));

      if (searchParams.get("project_task_id")) {
        setOpenTaskEditSheet(true);
        setTaskForUpdate(
          (project.project_tasks ?? []).find(
            (task) => task.id === Number(searchParams.get("project_task_id")),
          ),
        );
      }
    }
  }, [project]);

  if (projectLoading) {
    return <Skeleton className="size-full" />;
  }

  if (!project || projectError) {
    return (
      <div className="bg-sidebar flex size-full items-center justify-center rounded-md border p-4">
        <Alert variant="destructive" className="w-1/2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Проект не найден</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <DragDropProvider
        onDragStart={() => {
          previousItems.current = items;
          previousColumns.current = columns;
        }}
        onDragOver={(event) => {
          const { source } = event.operation;

          if (source?.type === "column") {
            const newColumns = move(columns, event);
            setColumns(newColumns);

            return;
          }

          const keys = Array.from(items?.keys() ?? []);

          const records = keys.reduce(
            (acc, element) => {
              acc[element.id] = items?.get(element) ?? [];
              return acc;
            },
            {} as Record<string, ProjectTaskDto[]>,
          );

          const moved = move(records, event);

          const reversed = Object.entries(moved).reduce(
            (acc, [key, value]) => {
              const columnKey = keys.find((k) => k.id === key);
              if (columnKey) {
                acc.set(columnKey, value);
              }
              return acc;
            },
            new Map() as Map<ProjectColumn, ProjectTaskDto[]>,
          );

          setItems(reversed);
        }}
        onDragEnd={(event) => {
          const { source } = event.operation;

          if (event.canceled) {
            if (source?.type === "item") {
              setItems(previousItems.current);
            }
            return;
          }

          if (source?.type === "item") {
            const currentItem = Array.from(items?.entries() ?? []).find(
              (item) => {
                return item[1].find((task) => task.id === source?.id);
              },
            );

            if (currentItem) {
              const column = currentItem[0];

              const task = currentItem[1].find(
                (task) => task.id === source?.id,
              );

              if (!project?.user_project_rights?.update) {
                if (task && task.column.id !== column.id) {
                  setItems(previousItems.current);
                  setOpenForbiddenEditAlertDialog(true);
                }

                return;
              }

              const list = [...currentItem[1]].map((task, index) => ({
                id: task.id,
                list_order: index,
              }));

              updateProjectTaskListOrder({
                project_id: Number(project_id),
                data: list,
              });

              if (task && task.column.id !== column.id)
                updateProjectTask({
                  project_id: Number(project_id),
                  task_id: task.id,
                  data: {
                    column,
                    done_date: column.is_final_stage
                      ? format(new Date(), "yyyy-MM-dd")
                      : null,
                  },
                });
            }
          }

          if (source?.type === "column") {
            const currentColumnIndex = columns.findIndex(
              (column) => column.id === source?.id,
            );

            const previousColumnIndex = previousColumns.current.findIndex(
              (column) => column.id === source?.id,
            );

            if (!project?.user_project_rights?.update) {
              if (currentColumnIndex !== previousColumnIndex) {
                setColumns(previousColumns.current);
                setOpenForbiddenEditAlertDialog(true);
              }

              return;
            }

            if (currentColumnIndex !== previousColumnIndex) {
              updateProject({
                project_id: Number(project_id),
                data: {
                  columns: columns.map((column, index) => ({
                    ...column,
                    order: index,
                  })),
                },
              });
            }
          }
        }}
      >
        <div className="bg-sidebar size-full max-h-full overflow-y-hidden rounded-md border p-4">
          <div className="flex max-h-full min-h-0 flex-col gap-y-4">
            <div className="flex items-center justify-between rounded-md border p-4">
              <span className="ml-1 text-base font-bold">{project.name}</span>
              {project?.team.user_role === "owner" && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (!project?.user_project_rights?.delete) {
                      setOpenForbiddenDeleteAlertDialog(true);
                    } else {
                      setOpenDeleteAlertDialog(true);
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="scroll flex size-full max-h-full gap-x-4 overflow-x-auto overflow-y-auto md:overflow-x-hidden">
              {columns.map((column, columnIndex) => (
                <ProjectSortableColumn
                  key={column.id}
                  index={columnIndex}
                  column={column}
                  onOpenColumnEditDialog={() => {
                    setColumnForUpdate(column);
                    setOpenColumnEditDialog(true);
                  }}
                >
                  <div className="flex flex-col gap-y-2">
                    {items?.get(column)?.map((task, taskIndex) => (
                      <ProjectSortableTask
                        key={task.id}
                        id={task.id}
                        index={taskIndex}
                        column={column}
                        task={task}
                        onClick={() => {
                          setTaskForUpdate(task);
                          setOpenTaskEditSheet(true);
                        }}
                      />
                    ))}
                  </div>
                </ProjectSortableColumn>
              ))}
              <Tooltip>
                <TooltipTrigger asChild className="mt-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                      if (!project?.user_project_rights?.create) {
                        setOpenForbiddenCreateAlertDialog(true);
                      } else {
                        setOpenColumnCreateDialog(true);
                      }
                    }}
                  >
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Добавить столбец</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </DragDropProvider>

      {project?.user_project_rights?.create && (
        <ProjectColumnCreateDialog
          open={openColumnCreateDialog}
          onOpenChange={setOpenColumnCreateDialog}
        />
      )}

      {project?.user_project_rights?.update && (
        <ProjectColumnEditDialog
          column={columnForUpdate}
          open={openColumnEditDialog}
          onOpenChange={setOpenColumnEditDialog}
        />
      )}

      <ProjectTaskEditSheet
        task={taskForUpdate}
        open={openTaskEditSheet}
        onOpenChange={(value) => {
          searchParams.delete("project_task_id");
          setSearchParams(searchParams);
          setOpenTaskEditSheet(value);
        }}
      />

      <ProjectDeleteAlertDialog
        open={openDeleteAlertDialog}
        onOpenChange={setOpenDeleteAlertDialog}
      />

      <ForbiddenCreateAlertDialog
        open={openForbiddenCreateAlertDialog}
        onOpenChange={setOpenForbiddenCreateAlertDialog}
      />

      <ForbiddenEditAlertDialog
        open={openForbiddenEditAlertDialog}
        onOpenChange={setOpenForbiddenEditAlertDialog}
      />

      <ForbiddenDeleteAlertDialog
        open={openForbiddenDeleteAlertDialog}
        onOpenChange={setOpenForbiddenDeleteAlertDialog}
      />
    </>
  );
}

export { Project };
