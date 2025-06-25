import { Alert, AlertDescription } from "@/shared/ui/alert";
import { InfoIcon } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { useHomeQueries } from "@/pages/home/hooks/use-home-queries";

function GoalsBoard() {
  const { goalsGeneralInfo } = useHomeQueries();

  return (
    <div className="h-full flex-1 rounded-md border p-4 pr-2 md:max-h-full md:min-h-0">
      <div className="flex h-full max-h-full min-h-0 flex-col">
        <h3 className="mb-1 text-base font-medium">Сводка по целям</h3>
        {!!goalsGeneralInfo?.length && (
          <span className="mb-3 text-xs font-medium">
            Задачи близкие к дедлайну
          </span>
        )}
        {goalsGeneralInfo?.every((goal) => !goal?.tasks?.length) && (
          <div className="mt-3 mr-2 flex">
            <Alert>
              <InfoIcon />
              <AlertDescription>
                У вас нет активных задач у которых дата дедлайна близка к
                текущей дате
              </AlertDescription>
            </Alert>
          </div>
        )}
        <div className="scroll relative mb-2 min-h-0 flex-1 overflow-y-auto pr-2">
          <div className="relative flex flex-col gap-y-2">
            {goalsGeneralInfo?.map((goal) => {
              if (goal.tasks?.length === 0) {
                return null;
              }

              return (
                <div key={goal.id} className="flex flex-col gap-y-2">
                  <div className="flex flex-nowrap items-center gap-4">
                    <Link to={`${ROUTES.goals_list}?goal_id=${goal.id}`}>
                      <span className="text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-white">
                        {goal.title}
                      </span>
                    </Link>
                    <div className="min-h-px w-full bg-neutral-700" />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    {goal.tasks?.map((task) => (
                      <Link
                        key={task.id}
                        to={`${ROUTES.goals_tasks}?task_id=${task.id}`}
                      >
                        <div className="rounded-md border p-2">
                          <div className="flex w-full items-center gap-x-2">
                            <div className="size-1 min-w-1 rounded-full bg-sky-600" />
                            <div className="flex w-full items-center justify-between gap-x-2">
                              <span className="text-sm font-medium">
                                {task.title}
                              </span>
                              <span className="text-xs font-medium text-red-400">
                                {format(task.deadline_date as string, "dd.MM")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {!goalsGeneralInfo?.every((goal) => !goal?.tasks?.length) && (
          <Link to={ROUTES.goals_tasks} className="pr-2 md:pr-0">
            <Button variant="outline" className="w-full md:w-fit">
              Перейти к задачам
            </Button>
          </Link>
        )}
        {goalsGeneralInfo?.every((goal) => !goal?.tasks?.length) && (
          <Link to={ROUTES.goals_list}>
            <Button variant="outline">Перейти к целям</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export { GoalsBoard };
