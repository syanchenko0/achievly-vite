import { useParams } from "react-router";
import {
  type ProjectColumn,
  type ProjectTaskDto,
  useGetProject,
} from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { DragDropProvider } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {
  AlertCircle,
  ChevronsUp,
  EllipsisVertical,
  Pencil,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useSortable } from "@dnd-kit/react/sortable";
import { CreateProjectTaskDialog } from "@/widgets/projects";
import { useEffect, useRef, useState } from "react";
import { move } from "@dnd-kit/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

function Project() {
  const { project_id } = useParams<{ project_id: string }>();

  const [items, setItems] = useState<Map<ProjectColumn, ProjectTaskDto[]>>();
  const [columns, setColumns] = useState<ProjectColumn[]>([]);

  const previousItems = useRef<Map<ProjectColumn, ProjectTaskDto[]>>(items);

  const { data: project, isLoading: projectLoading } = useGetProject(
    {
      project_id: project_id as string,
    },
    { query: { enabled: !!project_id } },
  );

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
    }
  }, [project]);

  if (projectLoading) {
    return <Skeleton className="size-full" />;
  }

  if (!project) {
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
    <DragDropProvider
      onDragStart={() => {
        previousItems.current = items;
      }}
      onDragOver={(event) => {
        const { source } = event.operation;

        if (source?.type === "column") return;

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

        if (source?.type === "column") {
          setColumns((columns) => move(columns, event));
        }
      }}
    >
      <div className="bg-sidebar size-full rounded-md border p-4">
        <div className="flex size-full gap-x-4">
          {columns.map((column, columnIndex) => (
            <Column key={column.id} index={columnIndex} column={column}>
              <div className="flex flex-col gap-y-2">
                {items
                  ?.get(column)
                  ?.map((task, taskIndex) => (
                    <ProjectTaskCard
                      key={task.id}
                      id={task.id}
                      index={taskIndex}
                      column={column}
                      task={task}
                    />
                  ))}
              </div>
            </Column>
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
}

function Column({
  index,
  children,
  column,
}: {
  index: number;
  column: ProjectColumn;
  children: React.ReactNode;
}) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { ref } = useSortable({
    id: column.id,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });

  return (
    <div className="flex size-full flex-col items-center gap-2" ref={ref}>
      <div className="flex size-full flex-col gap-y-4">
        <div className="bg-sidebar flex cursor-pointer items-center justify-between rounded-md border px-4 py-2">
          <h3 className="text-base font-medium">{column.name}</h3>
          <div className="flex items-center">
            {!column.removable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpenDialog(true)}
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
                <DropdownMenuItem>
                  <Pencil />
                  Редактировать столбец
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {children}
      </div>

      <CreateProjectTaskDialog
        open={openDialog}
        column={column}
        onOpenChange={setOpenDialog}
      />
    </div>
  );
}

export function ProjectTaskCard({
  id,
  index,
  column,
  task,
}: {
  id: number;
  index: number;
  column: ProjectColumn;
  task: ProjectTaskDto;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column.id,
  });

  return (
    <div className="cursor-pointer" ref={ref} data-dragging={isDragging}>
      <div className="flex flex-col rounded-md bg-neutral-700">
        <span className="truncate px-2 py-1 text-xs font-medium">
          {task.name}
        </span>
        <div className="flex flex-col rounded-md border border-neutral-600 bg-neutral-800 px-2 py-2">
          <div className="flex items-center justify-between">
            <Avatar className="size-5">
              <AvatarImage src={task.executor?.user.picture_url} />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center">
              <div>
                <ChevronsUp className="size-5" />
              </div>
            </div>
          </div>
          <span className="text-sm font-medium">
            {task?.description || task.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export { Project };
