import { useEffect, useRef, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGoalsQueryKey,
  type GoalDto,
  type UpdateGoalBody,
  updateGoalBodySchema,
  useDeleteGoal,
  useGetGoals,
  useUpdateGoal,
  useUpdateGoalListOrder,
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
import { GoalForm } from "@/widgets/goals";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

type GoalsState = {
  active: GoalDto[];
  done: GoalDto[];
};

function GoalsList() {
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
                  <SortableGoalCard
                    key={goal.id}
                    index={index}
                    column={column}
                    goal={goal}
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
          {column === "active" ? "Активные цели" : "Завершенные цели"}
        </h3>

        {children}
      </div>
    </div>
  );
}

function SortableGoalCard({
  index,
  column,
  goal,
}: {
  index: number;
  column: string;
  goal: GoalDto;
}) {
  const { ref } = useSortable({
    id: goal.id,
    index,
    group: column,
    type: "item",
    accept: ["item"],
  });

  return <GoalCard goal={goal} ref={ref} />;
}

function GoalCard({
  goal,
  ref,
}: {
  goal: GoalDto;
  ref: (element: Element | null) => void;
}) {
  const queryClient = useQueryClient();

  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const { mutate: updateGoal, isPending: updateGoalPending } = useUpdateGoal({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getGoalsQueryKey() })
          .then(() => setOpenSheet(false));
      },
    },
  });

  const { mutate: deleteGoal, isPending: deleteGoalPending } = useDeleteGoal({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getGoalsQueryKey() })
          .then(() => setOpenSheet(false));
      },
    },
  });

  const form = useForm({
    defaultValues: goal,
    resolver: zodResolver(updateGoalBodySchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: UpdateGoalBody) => {
    console.log(data);

    // updateGoal({ goal_id: String(goal.id), data });
  };

  const handleDeleteTask = () => {
    deleteGoal({ goal_id: String(goal.id) });
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
                {goal.title}
              </span>
              <div className="flex items-center gap-x-2">
                <CalendarIcon className="size-4" />
                <span className="text-xs">
                  {goal.deadline_date
                    ? format(new Date(goal.deadline_date), "PPPP", {
                        locale: ru,
                      })
                    : "Дата окончания цели не указана"}
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
        <SheetContent className="scroll w-[400px] overflow-y-auto sm:w-[580px] sm:max-w-[580px]">
          <SheetHeader>
            <SheetTitle>Редактировать задачу</SheetTitle>
            <SheetDescription>
              Измените данные в полях ниже и нажмите «Сохранить изменения»
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <GoalForm />
          </div>
          <SheetFooter>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateGoalPending}
            >
              {updateGoalPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Сохранить изменения"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={deleteGoalPending}
            >
              {deleteGoalPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Удалить цель"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Form>
    </Sheet>
  );
}

export { GoalsList };
