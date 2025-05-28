import { useEffect, useRef, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import {
  type TaskDto,
  useGetTasks,
  useUpdateTask,
  useUpdateTaskListOrder,
} from "@/shared/api";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { TaskSortableCard } from "@/widgets/goals/ui/task-sortable-card";
import { TaskUpdateSheet } from "@/widgets/goals";

type TasksState = {
  active: TaskDto[];
  done: TaskDto[];
};

function GoalsBoard() {
  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const [taskForUpdate, setTaskForUpdate] = useState<TaskDto>();

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
                  <TaskSortableCard
                    key={task.id}
                    id={task.id}
                    index={index}
                    task={task}
                    group={column}
                    type="item"
                    accept={["item"]}
                    onClick={() => {
                      setOpenSheet(true);
                      setTaskForUpdate(task);
                    }}
                  />
                ))}
              </div>
            </Column>
          ))}
        </div>
      </div>

      <TaskUpdateSheet
        open={openSheet}
        task={taskForUpdate}
        onOpenChange={(value) => {
          setOpenSheet(value);
          setTaskForUpdate(undefined);
        }}
      />
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

export { GoalsBoard };
