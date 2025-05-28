import { useEffect, useRef, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import {
  type GoalDto,
  useGetGoals,
  useUpdateGoal,
  useUpdateGoalListOrder,
} from "@/shared/api";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/shared/ui/skeleton";
import { GoalUpdateSheet } from "@/widgets/goals";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { GoalSortableCard } from "@/widgets/goals/ui/goal-sortable-card";

type GoalsState = {
  active: GoalDto[];
  done: GoalDto[];
};

function GoalsList() {
  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const [goalForUpdate, setGoalForUpdate] = useState<GoalDto>();

  const [goals, setGoals] = useState<GoalsState>({
    active: [],
    done: [],
  });

  const closestUpdateGoalListOrderFn = useRef<() => void>(null);

  const closestUpdateGoalFn = useRef<() => void>(null);

  const { data: allGoals, isLoading: allGoalsLoading } = useGetGoals({
    params: undefined,
  });

  const { mutate: updateGoal } = useUpdateGoal();

  const { mutate: updateGoalListOrder } = useUpdateGoalListOrder();

  useEffect(() => {
    if (allGoals) {
      setGoals((prev) => ({
        ...prev,
        active: allGoals.filter((t) => !t.achieved_date),
        done: allGoals.filter((t) => t.achieved_date),
      }));
    }
  }, [allGoals]);

  if (allGoalsLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const {
          operation: { source },
        } = event;

        setGoals((goals) => {
          const state = move(goals, event);

          const list = [...state.active, ...state.done].map((goal, index) => ({
            id: goal.id,
            list_order: index,
          }));

          closestUpdateGoalListOrderFn.current = () => {
            updateGoalListOrder({ data: list });
          };

          closestUpdateGoalFn.current = () => {
            const activeGoal = state.active.find((a) => a.id === source?.id);

            if (activeGoal) {
              updateGoal({
                goal_id: String(activeGoal.id),
                data: { ...activeGoal, achieved_date: null },
              });
            }

            if (!activeGoal) {
              const doneTask = state.done.find((a) => a.id === source?.id);

              if (doneTask)
                updateGoal({
                  goal_id: String(doneTask.id),
                  data: {
                    ...doneTask,
                    achieved_date: format(new Date(), "yyyy-MM-dd"),
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
        if (closestUpdateGoalListOrderFn.current) {
          closestUpdateGoalListOrderFn.current();
        }

        if (closestUpdateGoalFn.current) {
          closestUpdateGoalFn.current();
        }
      }}
    >
      <div className="bg-sidebar size-full rounded-md border p-4">
        <div className="flex size-full gap-x-4">
          {Object.entries(goals).map(([column, items]) => (
            <Column key={column} column={column}>
              <div className="flex flex-col gap-y-2">
                {items.length === 0 && (
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>
                      {column === "active"
                        ? "Отсутствуют цели"
                        : "Отсутствуют завершенные цели"}
                    </AlertTitle>
                    <AlertDescription>
                      {column === "active"
                        ? "Создайте цель, чтобы увидеть её в этом столбце"
                        : "Вы можете перетянуть цель в этот столбец, чтобы она считалась завершенной"}
                    </AlertDescription>
                  </Alert>
                )}

                {items.map((goal, index) => (
                  <GoalSortableCard
                    key={goal.id}
                    id={goal.id}
                    index={index}
                    goal={goal}
                    group={column}
                    type="item"
                    accept={["item"]}
                    onClick={() => {
                      setGoalForUpdate(goal);
                      setOpenSheet(true);
                    }}
                  />
                ))}
              </div>
            </Column>
          ))}
        </div>
      </div>

      <GoalUpdateSheet
        open={openSheet}
        goal={goalForUpdate}
        onOpenChange={(value) => {
          setOpenSheet(value);
          setGoalForUpdate(undefined);
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
          {column === "active" ? "Активные цели" : "Завершенные цели"}
        </h3>

        {children}
      </div>
    </div>
  );
}

export { GoalsList };
