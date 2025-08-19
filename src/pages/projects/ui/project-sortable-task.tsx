import type { ProjectColumn, ProjectTaskDto } from "@/shared/api";
import { useSortable } from "@dnd-kit/react/sortable";
import { intervalToDuration } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { CheckCircle, User } from "lucide-react";
import { cn, declension } from "@/app/lib/utils";

import { TaskPriority } from "@/pages/projects/ui/task-priority";

function ProjectSortableTask({
  id,
  index,
  column,
  task,
  onClick,
}: {
  id: number;
  index: number;
  column: ProjectColumn;
  task: ProjectTaskDto;
  onClick: () => void;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: ["item"],
    group: column.id,
  });

  const isTaskOverdue = task.deadline_date
    ? new Date(task.deadline_date) < new Date()
    : false;

  const taskOverdue =
    task?.deadline_date && !task?.done_date
      ? intervalToDuration({
          start: new Date(),
          end: task.deadline_date,
        })
      : null;

  return (
    <div
      className="cursor-pointer"
      ref={ref}
      data-dragging={isDragging}
      onClick={onClick}
    >
      <div className="flex flex-col rounded-md bg-neutral-700">
        {task?.parent_task?.name && (
          <span className="truncate px-2 py-1 text-xs font-medium">
            {task.parent_task.name}
          </span>
        )}
        <div className="flex flex-col gap-y-1 rounded-md border border-neutral-600 bg-neutral-800 px-2 py-2">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <Avatar className="size-5">
                  <AvatarImage src={task.executor?.user.picture_url} />
                  <AvatarFallback>
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>

                <span className="text-xs font-medium">
                  {task.executor?.user.username ?? "Нет исполнителя"}
                </span>
              </div>

              <div className="flex items-center">
                {task?.done_date && (
                  <div className="flex size-7 min-w-7 items-center justify-center">
                    <CheckCircle className="size-4 text-green-500" />
                  </div>
                )}
                {task?.priority && !task?.done_date && (
                  <TaskPriority priority={task.priority} />
                )}
                {!task?.priority && !task?.done_date && (
                  <div className="size-7 min-w-7" />
                )}
              </div>
            </div>

            <span className="px-1 py-1 text-xs font-medium">{task.name}</span>
          </div>

          {isTaskOverdue && taskOverdue && (
            <span className="text-xs text-red-400">
              Просрочена на{" "}
              {Math.abs(taskOverdue?.days ?? 0) > 0 &&
                `${Math.abs(taskOverdue?.days ?? 0)} ${declension(
                  Math.abs(taskOverdue?.days ?? 0),
                  ["день", "дня", "дней"],
                )}`}{" "}
              {Math.abs(taskOverdue?.hours ?? 0) > 0 &&
                `${Math.abs(taskOverdue?.hours ?? 0)} ${declension(
                  Math.abs(taskOverdue?.hours ?? 0),
                  ["час", "часа", "часов"],
                )}`}{" "}
            </span>
          )}

          {!isTaskOverdue && taskOverdue && (
            <span>
              <span className="text-xs font-medium text-neutral-400">
                До конца срока выполнения задачи:
              </span>{" "}
              <span className="text-xs">
                {(taskOverdue?.days ?? 0) > 0 && (
                  <>
                    <span>
                      {String(taskOverdue.days)}{" "}
                      {declension(Number(String(taskOverdue.days ?? 0)), [
                        "день",
                        "дня",
                        "дней",
                      ])}
                    </span>
                    {", "}
                  </>
                )}

                <span
                  className={cn({
                    ["text-red-400"]: !taskOverdue?.days,
                  })}
                >
                  {String(taskOverdue.hours ?? 0)}{" "}
                  {declension(Number(String(taskOverdue.hours ?? 0)), [
                    "час",
                    "часа",
                    "часов",
                  ])}
                </span>
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { ProjectSortableTask };
