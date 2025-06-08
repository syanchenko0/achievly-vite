import { useHomeQueries } from "@/pages/home/hooks/use-home-queries";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, replacePathParams } from "@/app/lib/utils";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { Button } from "@/shared/ui/button";

function Home() {
  const { projectsGeneralInfo, goalsGeneralInfo, eventsToday } =
    useHomeQueries();

  return (
    <div className="bg-sidebar size-full rounded-md border p-4">
      <div className="flex size-full gap-x-4">
        <div className="flex size-full max-h-full min-h-0 max-w-[35%] flex-col gap-y-4">
          <div className="h-full max-h-full min-h-0 flex-1 rounded-md border p-4 pr-1">
            <div className="flex h-full max-h-full min-h-0 flex-col">
              <h3 className="mb-4 text-base font-medium">События на сегодня</h3>
              {!eventsToday?.length && (
                <div className="mr-3 flex">
                  <Alert>
                    <InfoIcon />
                    <AlertDescription>
                      На сегодняшний день нет событий
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="scroll mb-2 min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-y-2">
                  {eventsToday?.map((event) => (
                    <div key={event.id} className="rounded-md border p-2">
                      <div className="flex w-full items-center gap-x-2">
                        <div className="size-1 min-w-1 rounded-full bg-green-700" />
                        <div className="flex w-full items-center justify-between gap-x-2">
                          <span className="text-sm font-medium">
                            {event.title}
                          </span>
                          <span
                            className={cn("text-xs font-medium", {
                              ["text-yellow-500"]:
                                event.end_timestamp < new Date().getTime(),
                            })}
                          >
                            {format(event.start_timestamp, "HH:mm")}-
                            {format(event.end_timestamp, "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to={ROUTES.events_calendar} className="pr-3">
                <Button variant="outline" className="w-full">
                  Перейти к календарю
                </Button>
              </Link>
            </div>
          </div>

          {/*<div className="flex-1 rounded-md border p-4">2</div>*/}
        </div>

        <div className="flex size-full flex-col gap-y-4">
          <div className="h-full max-h-full min-h-0 flex-1 rounded-md border p-4 pr-2">
            <div className="flex h-full max-h-full min-h-0 flex-col">
              <h3 className="mb-1 text-base font-medium">Сводка по целям</h3>
              {!!goalsGeneralInfo?.length && (
                <span className="mb-3 text-xs font-medium">
                  Задачи близкие к дедлайну
                </span>
              )}
              {goalsGeneralInfo?.every((goal) => !goal?.tasks?.length) && (
                <div className="mr-2 flex">
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
                                      {format(
                                        task.deadline_date as string,
                                        "dd.MM",
                                      )}
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
                <Link to={ROUTES.goals_tasks}>
                  <Button variant="outline">Перейти к задачам</Button>
                </Link>
              )}
              {goalsGeneralInfo?.every((goal) => !goal?.tasks?.length) && (
                <Link to={ROUTES.goals_list}>
                  <Button variant="outline">Перейти к целям</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="h-full max-h-full min-h-0 flex-1 rounded-md border p-4 pr-2">
            <div className="flex h-full max-h-full min-h-0 flex-col">
              <h3 className="mb-1 text-base font-medium">Сводка по проектам</h3>

              <div className="mb-2 flex w-full gap-x-4">
                {!projectsGeneralInfo?.upcoming_deadline?.every(
                  (project) => !project.project_tasks?.length,
                ) && (
                  <span className="w-full text-xs font-medium">
                    Задачи близкие к дедлайну
                  </span>
                )}
                {!projectsGeneralInfo?.assigned_me?.every(
                  (project) => !project.project_tasks?.length,
                ) && (
                  <span className="w-full text-xs font-medium">
                    Задачи назначенные мне
                  </span>
                )}
              </div>

              <div className="flex min-h-0 flex-1 gap-x-4">
                <div className="scroll mb-2 min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-y-2">
                    {projectsGeneralInfo?.upcoming_deadline?.map((project) => {
                      if (project.project_tasks?.length === 0) {
                        return (
                          <Alert key={project.id} className="mt-3">
                            <InfoIcon />
                            <AlertDescription>
                              Отсутствуют задачи у которых дата дедлайна близка
                              к текущей дате
                            </AlertDescription>
                          </Alert>
                        );
                      }

                      return (
                        <div key={project.id} className="flex flex-col gap-y-2">
                          <div className="flex flex-nowrap items-center gap-4">
                            <Link
                              to={replacePathParams(ROUTES.project, {
                                project_id: project.id,
                              })}
                            >
                              <span className="text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-white">
                                {project.name}
                              </span>
                            </Link>
                            <div className="min-h-px w-full bg-neutral-700" />
                          </div>
                          <div className="flex flex-col gap-y-2">
                            {project.project_tasks?.map((task) => (
                              <Link
                                key={task.id}
                                to={`${replacePathParams(ROUTES.project, {
                                  project_id: project.id,
                                })}?project_task_id=${task.id}`}
                              >
                                <div className="rounded-md border p-2">
                                  <div className="flex w-full items-center gap-x-2">
                                    <div className="size-1 min-w-1 rounded-full bg-sky-600" />
                                    <div className="flex w-full items-center justify-between gap-x-2">
                                      <span className="text-sm font-medium">
                                        {task.name}
                                      </span>
                                      <span className="text-xs font-medium text-red-400">
                                        {format(
                                          task.deadline_date as string,
                                          "dd.MM",
                                        )}
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

                <div className="scroll mb-2 min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-y-2">
                    {projectsGeneralInfo?.assigned_me?.map((project) => {
                      if (project.project_tasks?.length === 0) {
                        return (
                          <Alert key={project.id} className="mt-3">
                            <InfoIcon />
                            <AlertDescription>
                              Отсутствуют задачи, которые назначены мне
                            </AlertDescription>
                          </Alert>
                        );
                      }

                      return (
                        <div key={project.id} className="flex flex-col gap-y-2">
                          <div className="flex flex-nowrap items-center gap-4">
                            <Link
                              to={replacePathParams(ROUTES.project, {
                                project_id: project.id,
                              })}
                            >
                              <span className="text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-white">
                                {project.name}
                              </span>
                            </Link>
                            <div className="min-h-px w-full bg-neutral-700" />
                          </div>
                          <div className="flex flex-col gap-y-2">
                            {project.project_tasks?.map((task) => (
                              <Link
                                key={task.id}
                                to={`${replacePathParams(ROUTES.project, {
                                  project_id: project.id,
                                })}?project_task_id=${task.id}`}
                              >
                                <div className="rounded-md border p-2">
                                  <div className="flex w-full items-center gap-x-2">
                                    <div className="size-1 min-w-1 rounded-full bg-sky-600" />
                                    <div className="flex w-full items-center justify-between gap-x-2">
                                      <span className="text-sm font-medium">
                                        {task.name}
                                      </span>
                                      <span className="text-xs font-medium text-red-400">
                                        {format(
                                          task.deadline_date as string,
                                          "dd.MM",
                                        )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Home };
