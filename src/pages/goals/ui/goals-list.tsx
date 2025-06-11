import { useEffect, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import { type GoalDto } from "@/shared/api";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { useGoalsListQueries } from "@/pages/goals/hooks/use-goals-list-queries";
import { useSearchParams } from "react-router";
import { GoalSortableCard } from "@/pages/goals/ui/goal-sortable-card";
import { GoalUpdateSheet } from "@/pages/goals/ui/goal-update-sheet";

type GoalsState = {
  active: GoalDto[];
  done: GoalDto[];
};

function GoalsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [goalForUpdate, setGoalForUpdate] = useState<GoalDto>();
  const [goals, setGoals] = useState<GoalsState>({
    active: [],
    done: [],
  });

  const { initialGoals, allGoalsLoading, updateGoal, updateGoalListOrder } =
    useGoalsListQueries();

  useEffect(() => {
    if (initialGoals) {
      setGoals(initialGoals);
    }

    if (searchParams.get("goal_id")) {
      setOpenSheet(true);
      setGoalForUpdate(
        initialGoals.active.find(
          (goal) => goal.id === Number(searchParams.get("goal_id")),
        ),
      );
    }
  }, [initialGoals]);

  if (allGoalsLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setGoals((goals) => {
          const state = move(goals, event);

          return {
            active: state.active.map((a) => ({ ...a, achieved_date: null })),
            done: state.done.map((d) => ({
              ...d,
              achieved_date: format(new Date(), "yyyy-MM-dd"),
            })),
          };
        });
      }}
      onDragEnd={() => {
        const list = [...goals.active, ...goals.done].map((goal, index) => ({
          id: goal.id,
          list_order: index,
        }));

        updateGoalListOrder({ data: list });

        if (initialGoals.active.length !== goals.active.length) {
          const activeGoal = goals.active.find(
            (goal) =>
              !initialGoals.active.some((initGoal) => initGoal.id === goal.id),
          );

          if (activeGoal) {
            updateGoal({
              goal_id: String(activeGoal.id),
              data: { ...activeGoal, achieved_date: null },
            });
          } else {
            const doneGoal = goals.done.find(
              (goal) =>
                !initialGoals.done.some((initGoal) => initGoal.id === goal.id),
            );

            if (doneGoal) {
              updateGoal({
                goal_id: String(doneGoal.id),
                data: {
                  ...doneGoal,
                  achieved_date: format(new Date(), "yyyy-MM-dd"),
                },
              });
            }
          }
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
          searchParams.delete("goal_id");
          setSearchParams(searchParams);
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
