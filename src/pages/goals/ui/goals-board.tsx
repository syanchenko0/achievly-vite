import { useEffect, useRef, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  getTasksQueryKey,
  type TaskDto,
  type UpdateTaskBody,
  updateTaskBodySchema,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
  useUpdateTaskListOrder,
} from "@/shared/api";
import { CalendarIcon, GripVertical, InfoIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { TaskForm } from "@/widgets/goals";

import { ROUTES } from "@/shared/constants/router";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

type TasksState = {
  active: TaskDto[];
  done: TaskDto[];
};

function GoalsBoard() {
  const [tasks, setTasks] = useState<TasksState>({
    active: [],
    done: [],
  });

  const closestUpdateTaskListOrderFn = useRef<() => void>(null);

  const closestUpdateTaskFn = useRef<() => void>(null);

  const { data: allTasks, isLoading: allTasksLoading } = useGetTasks();

  const { mutate: updateTask } = useUpdateTask();

  const { mutate: updateTaskListOrder } = useUpdateTaskListOrder();

  useEffect(() => {
    if (allTasks) {
      setTasks((prev) => ({
        ...prev,
        active: allTasks.filter((t) => !t.done_date),
        done: allTasks.filter((t) => t.done_date),
      }));
    }
  }, [allTasks]);

  if (allTasksLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const {
          operation: { source },
        } = event;

        setTasks((tasks) => {
          const state = move(tasks, event);

          const list = [...state.active, ...state.done].map((task, index) => ({
            id: task.id,
            list_order: index,
          }));

          closestUpdateTaskListOrderFn.current = () => {
            updateTaskListOrder({ data: list });
          };

          closestUpdateTaskFn.current = () => {
            const activeTask = state.active.find((a) => a.id === source?.id);

            if (activeTask) {
              updateTask({
                task_id: String(activeTask.id),
                data: { ...activeTask, done_date: null },
              });
            }

            if (!activeTask) {
              const doneTask = state.done.find((a) => a.id === source?.id);

              if (doneTask)
                updateTask({
                  task_id: String(doneTask.id),
                  data: {
                    ...doneTask,
                    done_date: format(new Date(), "yyyy-MM-dd"),
                  },
                });
            }
          };

          return {
            active: state.active.map((a) => ({ ...a, done_date: null })),
            done: state.done.map((d) => ({
              ...d,
              done_date: format(new Date(), "yyyy-MM-dd"),
            })),
          };
        });
      }}
      onDragEnd={() => {
        if (closestUpdateTaskListOrderFn.current) {
          closestUpdateTaskListOrderFn.current();
        }

        if (closestUpdateTaskFn.current) {
          closestUpdateTaskFn.current();
        }
      }}
    >
      <div className="bg-sidebar size-full rounded-md border p-4">
        <div className="flex size-full gap-x-4">
          {Object.entries(tasks).map(([column, items]) => (
            <Column key={column} column={column}>
              <div className="flex flex-col gap-y-2">
                {items.length === 0 && (
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>
                      {column === "active"
                        ? "Отсутствуют задачи"
                        : "Отсутствуют выполненные задачи"}
                    </AlertTitle>
                    <AlertDescription>
                      {column === "active"
                        ? "Создайте цель и наполните ее задачами, чтобы увидеть их в этом столбце"
                        : "Вы можете перетянуть задачу в этот столбец, чтобы она считалась выполненной"}
                    </AlertDescription>
                  </Alert>
                )}

                {items.map((task, index) => (
                  <SortableTaskCard
                    key={task.id}
                    index={index}
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
  children,
  column,
}: {
  children: React.ReactNode;
  column: string;
}) {
  const { ref } = useDroppable({
    id: column,
    type: "column",
    accept: ["item"],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      className="bg-sidebar flex size-full flex-col items-center gap-2 rounded-md border p-4 pr-1"
      ref={ref}
    >
      <div className="scroll size-full overflow-x-hidden overflow-y-auto pr-1">
        <h3 className="mb-4 text-base font-medium">
          {column === "active"
            ? "Задачи, доступные для выполнения"
            : "Выполненные задачи"}
        </h3>

        {children}
      </div>
    </div>
  );
}

function SortableTaskCard({
  index,
  column,
  task,
}: {
  index: number;
  column: string;
  task: TaskDto;
}) {
  const { ref } = useSortable({
    id: task.id,
    index,
    group: column,
    type: "item",
    accept: ["item"],
  });

  return <TaskCard task={task} ref={ref} />;
}

function TaskCard({
  task,
  ref,
}: {
  task: TaskDto;
  ref: (element: Element | null) => void;
}) {
  const queryClient = useQueryClient();

  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const { mutate: updateTask, isPending: updateTaskPending } = useUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getTasksQueryKey() })
          .then(() => setOpenSheet(false));
      },
    },
  });

  const { mutate: deleteTask, isPending: deleteTaskPending } = useDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getTasksQueryKey() })
          .then(() => setOpenSheet(false));
      },
    },
  });

  const form = useForm({
    defaultValues: task,
    resolver: zodResolver(updateTaskBodySchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: UpdateTaskBody) => {
    updateTask({ task_id: String(task.id), data });
  };

  const handleDeleteTask = () => {
    deleteTask({ task_id: String(task.id) });
  };

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <button
          ref={ref}
          className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 shadow-sm"
        >
          <div className="flex justify-between">
            <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
            <div className="flex flex-col gap-y-2">
              <span className="text-left text-base font-medium">
                {task.title}
              </span>
              <div className="flex items-center gap-x-2">
                <CalendarIcon className="size-4" />
                <span className="text-xs">
                  {task.deadline_date
                    ? format(new Date(task.deadline_date), "PPPP", {
                        locale: ru,
                      })
                    : "Дата окончания задачи не указана"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <GripVertical className="text-neutral-400" />
            </div>
          </div>
        </button>
      </SheetTrigger>
      <Form {...form}>
        <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
          <SheetHeader>
            <SheetTitle>Редактировать задачу</SheetTitle>
            <SheetDescription>
              Измените данные в полях ниже и нажмите «Сохранить изменения»
            </SheetDescription>
          </SheetHeader>
          {task.goal && (
            <div className="px-4">
              <div className="flex items-center gap-x-4 rounded-md border p-2">
                <InfoIcon className="size-4" />
                <span className="text-foreground text-sm">
                  Задача относится к цели:{" "}
                  <Link
                    to={`${ROUTES.goals_list}?goal_id=${task.goal.id}`}
                    className="font-medium underline transition-colors hover:text-sky-600"
                  >
                    {task.goal.title}
                  </Link>
                </span>
              </div>
            </div>
          )}
          <div className="p-4">
            <TaskForm />
          </div>
          <SheetFooter>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateTaskPending}
            >
              {updateTaskPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Сохранить изменения"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={deleteTaskPending}
            >
              {deleteTaskPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Удалить задачу"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Form>
    </Sheet>
  );
}

export { GoalsBoard };
