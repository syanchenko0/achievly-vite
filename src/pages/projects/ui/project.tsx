import { Link, useParams, useSearchParams } from "react-router";
import {
  getProjectQueryKey,
  type ProjectColumn,
  type ProjectTaskDto,
} from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import { ProjectColumnEditDialog } from "@/pages/projects/ui/project-column-edit-dialog";
import { ProjectTaskEditSheet } from "@/pages/projects/ui/project-task-edit-sheet";
import { Button } from "@/shared/ui/button";
import { ProjectColumnCreateDialog } from "@/pages/projects/ui/project-column-create-dialog";
import { ForbiddenEditAlertDialog } from "@/pages/projects/ui/forbidden-edit-alert-dialog";
import { ForbiddenCreateAlertDialog } from "@/pages/projects/ui/forbidden-create-alert-dialog";
import { ProjectDeleteAlertDialog } from "@/pages/projects/ui/project-delete-alert-dialog";
import { ForbiddenDeleteAlertDialog } from "@/pages/projects/ui/forbidden-delete-alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "@/app/lib/socket";
import { ProjectColumns } from "@/pages/projects/ui/project-columns";
import { ProjectTasks } from "@/pages/projects/ui/project-tasks";
import { GroupByDropdown } from "@/pages/projects/ui/group-by-dropdown";
import { ROUTES } from "@/shared/constants/router";
import { replacePathParams } from "@/app/lib/utils";

function Project() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { project_id } = useParams<{ project_id: string }>();

  const [openColumnCreateDialog, setOpenColumnCreateDialog] =
    useState<boolean>(false);
  const [openColumnEditDialog, setOpenColumnEditDialog] =
    useState<boolean>(false);
  const [openTaskEditSheet, setOpenTaskEditSheet] = useState<boolean>(false);
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] =
    useState<boolean>(false);

  const [openForbiddenCreateAlertDialog, setOpenForbiddenCreateAlertDialog] =
    useState<boolean>(false);
  const [openForbiddenEditAlertDialog, setOpenForbiddenEditAlertDialog] =
    useState<boolean>(false);
  const [openForbiddenDeleteAlertDialog, setOpenForbiddenDeleteAlertDialog] =
    useState<boolean>(false);

  const [columnForUpdate, setColumnForUpdate] = useState<ProjectColumn>();
  const [taskForUpdate, setTaskForUpdate] = useState<ProjectTaskDto>();

  const { project, projectLoading, projectError } = useProjectQueries();

  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("project_invalidation", () => {
      queryClient
        .invalidateQueries({
          queryKey: getProjectQueryKey({
            project_id: project_id as string,
          }),
        })
        .then();
    });

    return () => {
      socket.off("project_invalidation");
    };
  }, []);

  useEffect(() => {
    if (project) {
      if (searchParams.get("project_task_id")) {
        setOpenTaskEditSheet(true);
        setTaskForUpdate(
          (project.project_tasks ?? []).find(
            (task) => task.id === Number(searchParams.get("project_task_id")),
          ),
        );
      }
    }
  }, [project]);

  if (projectLoading) {
    return <Skeleton className="size-full" />;
  }

  if (!project || projectError) {
    return (
      <div className="bg-sidebar flex size-full items-center justify-center rounded-md border p-4">
        <Alert variant="destructive" className="w-1/2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Проект не найден</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="bg-sidebar size-full max-h-full overflow-y-hidden rounded-md border p-4">
        <div className="flex h-full max-h-full min-h-0 flex-col gap-y-4">
          <div className="flex items-center justify-between rounded-md border p-4">
            <span className="ml-1 text-base font-bold">{project.name}</span>

            <div className="flex items-center gap-x-2">
              {project?.team.user_role === "owner" && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (!project?.user_project_rights?.delete) {
                      setOpenForbiddenDeleteAlertDialog(true);
                    } else {
                      setOpenDeleteAlertDialog(true);
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <GroupByDropdown />

            <Link
              to={replacePathParams(ROUTES.project_parent_tasks, {
                project_id: String(project.id),
              })}
            >
              <Button size="sm" variant="ghost">
                <span>Родительские задачи</span>
                <ExternalLink />
              </Button>
            </Link>
          </div>

          <div className="size-full max-h-full min-h-0 flex-1">
            <div className="scroll flex max-h-full min-h-full flex-col gap-y-4 overflow-y-auto md:overflow-x-auto">
              <ProjectColumns
                onCreateColumn={() => {
                  if (!project?.user_project_rights?.create) {
                    setOpenForbiddenCreateAlertDialog(true);
                  } else {
                    setOpenColumnCreateDialog(true);
                  }
                }}
                onOpenForbiddenEditAlertDialog={() =>
                  setOpenForbiddenEditAlertDialog(true)
                }
                onOpenColumnEditDialog={(column: ProjectColumn) => {
                  setColumnForUpdate(column);
                  setOpenColumnEditDialog(true);
                }}
              />

              <ProjectTasks
                onOpenTaskEditSheet={(task) => {
                  setTaskForUpdate(task);
                  setOpenTaskEditSheet(true);
                }}
                onOpenForbiddenEditAlertDialog={() =>
                  setOpenForbiddenEditAlertDialog(true)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {project?.user_project_rights?.create && (
        <ProjectColumnCreateDialog
          open={openColumnCreateDialog}
          onOpenChange={setOpenColumnCreateDialog}
        />
      )}

      {project?.user_project_rights?.update && (
        <ProjectColumnEditDialog
          column={columnForUpdate}
          open={openColumnEditDialog}
          onOpenChange={setOpenColumnEditDialog}
        />
      )}

      <ProjectTaskEditSheet
        task={taskForUpdate}
        open={openTaskEditSheet}
        onOpenChange={(value) => {
          searchParams.delete("project_task_id");
          setSearchParams(searchParams);
          setOpenTaskEditSheet(value);
        }}
      />

      <ProjectDeleteAlertDialog
        open={openDeleteAlertDialog}
        onOpenChange={setOpenDeleteAlertDialog}
      />

      <ForbiddenCreateAlertDialog
        open={openForbiddenCreateAlertDialog}
        onOpenChange={setOpenForbiddenCreateAlertDialog}
      />

      <ForbiddenEditAlertDialog
        open={openForbiddenEditAlertDialog}
        onOpenChange={setOpenForbiddenEditAlertDialog}
      />

      <ForbiddenDeleteAlertDialog
        open={openForbiddenDeleteAlertDialog}
        onOpenChange={setOpenForbiddenDeleteAlertDialog}
      />
    </>
  );
}

export { Project };
