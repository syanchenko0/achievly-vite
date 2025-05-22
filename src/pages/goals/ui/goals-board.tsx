import { useEffect, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import { type TaskDto, useGetGoals, useUpdateTasks } from "@/shared/api";
import { GOALS_STATUS } from "@/shared/constants/goals";
import { CalendarIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Skeleton } from "@/shared/ui/skeleton";

type TasksState = {
  active: TaskDto[];
  done: TaskDto[];
};

function GoalsBoard() {
  const [tasks, setTasks] = useState<TasksState>({
    active: [],
    done: [],
  });

  const { data: goals, isLoading: goalsLoading } = useGetGoals({
    params: { status: GOALS_STATUS.ongoing },
  });

  const { mutate: updateTasks } = useUpdateTasks();

  const onDragEnd = () => {
    updateTasks({ data: [...tasks.active, ...tasks.done] });
  };

  useEffect(() => {
    if (goals) {
      setTasks((prev) => ({
        ...prev,
        active: goals.flatMap((g) =>
          (g.tasks || [])
            .filter((t) => !t.done_date)
            .map((t) => ({ ...t, goal_id: g.id })),
        ),
        done: goals.flatMap((g) =>
          (g.tasks || [])
            .filter((t) => t.done_date)
            .map((t) => ({ ...t, goal_id: g.id })),
        ),
      }));
    }
  }, [goals]);

  if (goalsLoading) {
    return (
      <div className="bg-sidebar size-full rounded-md border p-4">
        <Skeleton className="size-full rounded-md border p-4" />
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setTasks((tasks) => {
          const state = move(tasks, event);

          return {
            active: state.active.map((t) => ({ ...t, done_date: null })),
            done: state.done.map((t) => ({
              ...t,
              done_date: format(new Date(), "yyyy-MM-dd"),
            })),
          };
        });
      }}
      onDragEnd={onDragEnd}
    >
      <div className="bg-sidebar size-full rounded-md border p-4">
        <div className="flex size-full gap-x-4">
          {Object.entries(tasks).map(([column, items]) => (
            <Column key={column} column={column}>
              {items.map((task, index) => (
                <TaskCard
                  key={task.id}
                  index={index}
                  column={column}
                  task={task}
                />
              ))}
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

function TaskCard({
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

  return (
    <button
      ref={ref}
      className="bg-sidebar relative mb-2 w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 shadow-sm"
    >
      <div className="flex justify-between">
        <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
        <div className="flex flex-col gap-y-2">
          <span className="text-left text-base font-medium">{task.title}</span>
          <div className="flex items-center gap-x-2">
            <CalendarIcon className="size-4" />
            <span className="text-xs">
              {task.deadline_date
                ? format(new Date(task.deadline_date), "PPPP", { locale: ru })
                : "Дата окончания задачи не указана"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <GripVertical className="text-neutral-400" />
        </div>
      </div>
    </button>
  );
}

export { GoalsBoard };
