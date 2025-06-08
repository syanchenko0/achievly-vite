import type { ProjectColumn, ProjectTaskDto } from "@/shared/api";
import { useSortable } from "@dnd-kit/react/sortable";
import { intervalToDuration } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ChevronsUp, ChevronUp, TriangleAlert, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn, declension } from "@/app/lib/utils";
import {
  PROJECT_TASK_PRIORITY,
  PROJECT_TASK_PRIORITY_LABELS,
} from "@/shared/constants/projects";

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
    accept: "item",
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
        <span className="truncate px-2 py-1 text-xs font-medium">
          {task.name}
        </span>
        <div className="flex flex-col gap-y-1 rounded-md border border-neutral-600 bg-neutral-800 px-2 py-2">
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
              {task?.priority ? (
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "flex size-7 min-w-7 cursor-pointer items-center justify-center rounded-md p-1 transition-colors",
                        {
                          "hover:bg-green-500/20":
                            task.priority === PROJECT_TASK_PRIORITY.LOW,
                          "hover:bg-yellow-400/20":
                            task.priority === PROJECT_TASK_PRIORITY.MEDIUM,
                          "hover:bg-red-500/20":
                            task.priority === PROJECT_TASK_PRIORITY.HIGH ||
                            task.priority === PROJECT_TASK_PRIORITY.CRITICAL,
                        },
                      )}
                    >
                      {task.priority === PROJECT_TASK_PRIORITY.LOW && (
                        <ChevronUp className="size-5 text-green-500" />
                      )}
                      {task.priority === PROJECT_TASK_PRIORITY.MEDIUM && (
                        <ChevronsUp className="size-5 text-yellow-400" />
                      )}
                      {task.priority === PROJECT_TASK_PRIORITY.HIGH && (
                        <ChevronsUp className="size-5 text-red-500" />
                      )}
                      {task.priority === PROJECT_TASK_PRIORITY.CRITICAL && (
                        <TriangleAlert className="size-4 text-red-500" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {
                      PROJECT_TASK_PRIORITY_LABELS[
                        task.priority as keyof typeof PROJECT_TASK_PRIORITY
                      ]
                    }
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="size-7 min-w-7" />
              )}
            </div>
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
