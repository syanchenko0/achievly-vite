import { useSearchParams } from "react-router";
import { useState } from "react";
import type { GoalDto } from "@/shared/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { GoalUpdateSheet } from "@/pages/goals/ui/goal-update-sheet";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { GOAL_CATEGORY_ICONS } from "@/shared/constants/goals";
import { useGoalsListQueries } from "@/pages/goals/hooks/use-goals-list-queries";

function GoalsListMobile() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [goalForUpdate, setGoalForUpdate] = useState<GoalDto>();

  const { initialGoals } = useGoalsListQueries();

  return (
    <div className="bg-sidebar size-full rounded-md border p-4">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="done">Завершенные</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="flex flex-col gap-y-2">
            {initialGoals.active.length === 0 && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Отсутствуют задачи</AlertTitle>
                <AlertDescription>
                  Создайте цель и наполните ее задачами, чтобы увидеть их в этом
                  столбце
                </AlertDescription>
              </Alert>
            )}

            {initialGoals.active?.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => {
                  setOpenSheet(true);
                  setGoalForUpdate(goal);
                }}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="done">
          {initialGoals.done.length === 0 && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Отсутствуют выполненные задачи</AlertTitle>
              <AlertDescription>
                Вы можете отметить задачу выполненной, чтобы она попала в этот
                столбец
              </AlertDescription>
            </Alert>
          )}

          {initialGoals.done?.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => {
                setOpenSheet(true);
                setGoalForUpdate(goal);
              }}
            />
          ))}
        </TabsContent>
      </Tabs>

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
    </div>
  );
}

function GoalCard({ goal, onClick }: { goal: GoalDto; onClick: () => void }) {
  return (
    <button
      className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 shadow-sm"
      onClick={onClick}
    >
      <div className="flex w-full items-center gap-x-2">
        <div className="flex size-8 min-w-8 items-center justify-center rounded-md bg-neutral-700">
          <GoalCategoryIcon category={goal?.category} size={18} />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-y-1">
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
        </div>
      </div>
    </button>
  );
}

function GoalCategoryIcon({
  category,
  size,
}: {
  category?: string;
  size?: number;
}) {
  const Component = GOAL_CATEGORY_ICONS[category || "default"];

  return <Component size={size || 64} />;
}

export { GoalsListMobile };
