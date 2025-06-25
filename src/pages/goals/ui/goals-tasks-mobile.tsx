import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useGoalsTasksQueries } from "@/pages/goals/hooks/use-goals-tasks-queries";
import { declension } from "@/app/lib/utils";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { format, intervalToDuration } from "date-fns";
import { ru } from "date-fns/locale";
import type { TaskDto } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { TaskUpdateSheet } from "@/pages/goals/ui/task-update-sheet";
import { useState } from "react";
import { useSearchParams } from "react-router";

function GoalsTasksMobile() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [taskForUpdate, setTaskForUpdate] = useState<TaskDto>();

  const { initialTasks } = useGoalsTasksQueries();

  return (
    <div className="bg-sidebar size-full rounded-md border p-4">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="done">Завершенные</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="flex flex-col gap-y-2">
            {initialTasks.active.length === 0 && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Отсутствуют задачи</AlertTitle>
                <AlertDescription>
                  Создайте цель и наполните ее задачами, чтобы увидеть их в этом
                  столбце
                </AlertDescription>
              </Alert>
            )}

            {initialTasks.active?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  setOpenSheet(true);
                  setTaskForUpdate(task);
                }}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="done">
          {initialTasks.done.length === 0 && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Отсутствуют выполненные задачи</AlertTitle>
              <AlertDescription>
                Вы можете отметить задачу выполненной, чтобы она попала в этот
                столбец
              </AlertDescription>
            </Alert>
          )}

          {initialTasks.done?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => {
                setOpenSheet(true);
                setTaskForUpdate(task);
              }}
            />
          ))}
        </TabsContent>
      </Tabs>

      <TaskUpdateSheet
        open={openSheet}
        task={taskForUpdate}
        onOpenChange={(value) => {
          setOpenSheet(value);
          searchParams.delete("task_id");
          setSearchParams(searchParams);
        }}
      />
    </div>
  );
}

function TaskCard({ task, onClick }: { task: TaskDto; onClick: () => void }) {
  const isTaskOverdue = task.deadline_date
    ? new Date(task.deadline_date) < new Date()
    : false;

  const taskOverdue = task.deadline_date
    ? intervalToDuration({
        start: task.deadline_date,
        end: new Date(),
      })
    : null;

  return (
    <div
      className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2"
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
        <div className="flex flex-col gap-y-2">
          <span className="text-left text-base font-medium">{task.title}</span>
          <div className="flex items-center gap-x-2">
            <CalendarIcon className="size-4" />
            {task.done_date && (
              <span className="text-xs">
                Задача выполнена{" "}
                {format(new Date(task.done_date), "P", {
                  locale: ru,
                })}
              </span>
            )}
            {!task?.done_date && (
              <span className="text-xs">
                {isTaskOverdue && task.deadline_date && (
                  <span className="text-red-400">
                    Просрочена на{" "}
                    {(taskOverdue?.days ?? 0) > 0 &&
                      `${taskOverdue?.days ?? 0} ${declension(
                        taskOverdue?.days ?? 0,
                        ["день", "дня", "дней"],
                      )}`}{" "}
                    {(taskOverdue?.hours ?? 0) > 0 &&
                      `${taskOverdue?.hours ?? 0} ${declension(
                        taskOverdue?.hours ?? 0,
                        ["час", "часа", "часов"],
                      )}`}{" "}
                  </span>
                )}
                {!isTaskOverdue &&
                  task.deadline_date &&
                  format(new Date(task.deadline_date), "PPPP", {
                    locale: ru,
                  })}
                {!task.deadline_date && "Дата окончания задачи не указана"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { GoalsTasksMobile };
