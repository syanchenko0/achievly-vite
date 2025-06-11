import { Alert, AlertDescription } from "@/shared/ui/alert";
import { InfoIcon } from "lucide-react";
import { Link } from "react-router";
import { replacePathParams } from "@/app/lib/utils";
import { ROUTES } from "@/shared/constants/router";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { useHomeQueries } from "@/pages/home/hooks/use-home-queries";
import { useTeamSettingsStore } from "@/app/store/team";
import { ProjectCreateDialog } from "@/features/projects";
import { useState } from "react";

function ProjectsBoard() {
  const [projectCreateDialogOpen, setProjectCreateDialogOpen] =
    useState<boolean>(false);

  const teamId = useTeamSettingsStore((state) => state.activeTeamId);

  const { projectsGeneralInfo, projectsGeneralInfoError } = useHomeQueries();

  return (
    <div className="h-full max-h-full min-h-0 flex-1 rounded-md border p-4 pr-2">
      <div className="flex h-full max-h-full min-h-0 flex-col">
        <h3 className="mb-1 text-base font-medium">Сводка по проектам</h3>

        {(!projectsGeneralInfo || projectsGeneralInfoError) && !teamId && (
          <div className="mt-3 mr-2 flex">
            <Alert>
              <InfoIcon />
              <AlertDescription>
                У вас не выбрана или не создана команда.
                <br /> Создайте или выберите команду, чтобы просмотреть
                информацию по проектам
              </AlertDescription>
            </Alert>
          </div>
        )}

        {(!projectsGeneralInfo || projectsGeneralInfoError) && teamId && (
          <div className="mt-3 mr-2 flex">
            <Alert>
              <InfoIcon />
              <AlertDescription>
                В вашей команде отсутствуют проекты.
                <br /> Создайте проект и добавьте в него задачи
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="mb-2 flex w-full gap-x-4">
          {projectsGeneralInfo && !projectsGeneralInfoError && (
            <span className="w-full text-xs font-medium">
              Задачи близкие к дедлайну
            </span>
          )}
          {projectsGeneralInfo && !projectsGeneralInfoError && (
            <span className="w-full text-xs font-medium">
              Задачи назначенные мне
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 gap-x-4">
          {projectsGeneralInfo && !projectsGeneralInfoError && (
            <>
              <div className="scroll mb-2 min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-y-2">
                  {projectsGeneralInfo?.upcoming_deadline?.every(
                    (project) => !project.project_tasks?.length,
                  ) && (
                    <Alert className="mt-3">
                      <InfoIcon />
                      <AlertDescription>
                        Отсутствуют задачи у которых дата дедлайна близка к
                        текущей дате
                      </AlertDescription>
                    </Alert>
                  )}
                  {projectsGeneralInfo?.upcoming_deadline?.map((project) => {
                    if (project.project_tasks?.length === 0) {
                      return null;
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
                  {projectsGeneralInfo?.assigned_me?.every(
                    (project) => !project.project_tasks?.length,
                  ) && (
                    <Alert className="mt-3">
                      <InfoIcon />
                      <AlertDescription>
                        Отсутствуют задачи, которые назначены мне
                      </AlertDescription>
                    </Alert>
                  )}
                  {projectsGeneralInfo?.assigned_me?.map((project) => {
                    if (project.project_tasks?.length === 0) {
                      return null;
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
            </>
          )}
        </div>

        {(!projectsGeneralInfo || projectsGeneralInfoError) && teamId && (
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => setProjectCreateDialogOpen(true)}
          >
            Создать проект
          </Button>
        )}
      </div>

      <ProjectCreateDialog
        open={projectCreateDialogOpen}
        onOpenChange={setProjectCreateDialogOpen}
      />
    </div>
  );
}

export { ProjectsBoard };
