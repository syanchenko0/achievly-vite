import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import { useProjectStore } from "@/app/store/project";
import { groupBy } from "@/app/lib/utils";
import { ProjectSortableTask } from "@/pages/projects/ui/project-sortable-task";
import type { ProjectColumn, ProjectTaskDto } from "@/shared/api";
import { PROJECT_TASK_GROUP_BY } from "@/shared/constants/projects";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { move } from "@dnd-kit/helpers";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { ChevronDownIcon, Maximize2, Minimize2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/shared/ui/button";

function ProjectTasks({
  onOpenTaskEditSheet,
  onOpenForbiddenEditAlertDialog,
}: {
  onOpenTaskEditSheet: (task: ProjectTaskDto) => void;
  onOpenForbiddenEditAlertDialog: () => void;
}) {
  const [openedGroups, setOpenedGroups] = useState<string[]>([]);

  const { project } = useProjectQueries();

  const group_by = useProjectStore((store) => store.groupBy);

  const groupedByKey = useMemo(
    () =>
      groupBy(project?.project_tasks ?? [], (task) => {
        switch (group_by) {
          case PROJECT_TASK_GROUP_BY.PARENT_TASK:
            return task.parent_task?.id ?? "undefined";
          case PROJECT_TASK_GROUP_BY.ASSIGNEE:
            return task.executor?.id ?? "undefined";
          default:
            return "undefined";
        }
      }),
    [group_by, project?.project_tasks],
  );

  const getGroupName = (key: string | number) => {
    switch (group_by) {
      case PROJECT_TASK_GROUP_BY.PARENT_TASK:
        return (
          project?.project_parent_tasks?.find(
            (parent_task) => parent_task.id === Number(key),
          )?.name ?? "Без родительской задачи"
        );
      case PROJECT_TASK_GROUP_BY.ASSIGNEE:
        return (
          project?.team?.members?.find((member) => member.id === Number(key))
            ?.user?.username ?? "Без исполнителя"
        );
      default:
        return "Без группы";
    }
  };

  const toggleOpenedGroup = (state: "open" | "close") => {
    if (state === "open") {
      setOpenedGroups(Object.keys(groupedByKey));
    } else {
      setOpenedGroups([]);
    }
  };

  if (group_by === PROJECT_TASK_GROUP_BY.NONE) {
    return (
      <GroupedByColumn
        project_columns={project?.columns ?? []}
        project_tasks={project?.project_tasks ?? []}
        onOpenTaskEditSheet={onOpenTaskEditSheet}
        onOpenForbiddenEditAlertDialog={onOpenForbiddenEditAlertDialog}
      />
    );
  }

  return (
    <div className="flex max-h-full min-h-0 flex-1 flex-col gap-y-2">
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            toggleOpenedGroup(
              openedGroups.length !== Object.keys(groupedByKey).length
                ? "open"
                : "close",
            )
          }
        >
          {openedGroups.length !== Object.keys(groupedByKey).length ? (
            <Maximize2 />
          ) : (
            <Minimize2 />
          )}
          {openedGroups.length !== Object.keys(groupedByKey).length
            ? "Развернуть все"
            : "Свернуть все"}
        </Button>
      </div>

      {Object.entries(groupedByKey)?.map(([key, tasks]) => (
        <Collapsible
          open={openedGroups.includes(key)}
          onOpenChange={() => {
            setOpenedGroups((prev) => {
              if (prev.includes(key)) {
                return prev.filter((item) => item !== key);
              } else {
                return [...prev, key];
              }
            });
          }}
          key={key}
        >
          <CollapsibleTrigger className="flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md px-2 py-4 text-left text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180">
            <span>{getGroupName(key)}</span>
            <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <GroupedByColumn
              project_columns={project?.columns ?? []}
              project_tasks={tasks}
              onOpenTaskEditSheet={onOpenTaskEditSheet}
              onOpenForbiddenEditAlertDialog={onOpenForbiddenEditAlertDialog}
            />
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

function GroupedByColumn({
  project_columns,
  project_tasks,
  onOpenTaskEditSheet,
  onOpenForbiddenEditAlertDialog,
}: {
  project_columns: ProjectColumn[];
  project_tasks: ProjectTaskDto[];
  onOpenTaskEditSheet: (task: ProjectTaskDto) => void;
  onOpenForbiddenEditAlertDialog: () => void;
}) {
  const setGroupedByColumnStateFn = () => {
    const grouped = groupBy(project_tasks ?? [], ({ column }) => column.id);

    project_columns.forEach((column) => {
      if (!grouped[column.id]) {
        grouped[column.id] = [];
      }
    });

    return grouped;
  };

  const [groupedByColumn, setGroupedByColumn] = useState(
    setGroupedByColumnStateFn,
  );

  const { project_id } = useParams<{ project_id: string }>();

  const { project, updateProjectTaskListOrder, updateProjectTask } =
    useProjectQueries();

  const columns = project_columns;

  const previousGroupedByColumn =
    useRef<Record<string, ProjectTaskDto[]>>(groupedByColumn);

  useEffect(() => {
    setGroupedByColumn(setGroupedByColumnStateFn);
  }, [project_tasks]);

  return (
    <DragDropProvider
      onDragStart={() => {
        previousGroupedByColumn.current = groupedByColumn;
      }}
      onDragOver={(event) => {
        const { source } = event.operation;

        if (source?.type === "column") {
          return;
        }

        setGroupedByColumn((prev) => move(prev, event));
      }}
      onDragEnd={async (event) => {
        const { source } = event.operation;

        if (event.canceled) {
          setGroupedByColumn(previousGroupedByColumn.current);

          return;
        }

        if (source?.type === "item") {
          const currentItem = Array.from(
            Object.entries(groupedByColumn) ?? [],
          ).find((item) => {
            return item[1].find((task) => task.id === source?.id);
          });

          if (currentItem) {
            const column = project_columns.find(
              (column) => column.id === currentItem[0],
            );

            const task = currentItem[1].find((task) => task.id === source?.id);

            if (!column) return;

            if (!project?.user_project_rights?.update) {
              if (task && task.column.id !== column.id) {
                setGroupedByColumn(previousGroupedByColumn.current);
                onOpenForbiddenEditAlertDialog();
              }

              return;
            }

            const list = [...currentItem[1]].map((task, index) => ({
              id: task.id,
              list_order: index,
            }));

            if (task && task.column.id !== column.id) {
              await updateProjectTask({
                project_id: Number(project_id),
                task_id: task.id,
                data: {
                  ...task,
                  parent_task_id: task?.parent_task?.id,
                  column,
                  done_date: column.is_final_stage
                    ? format(new Date(), "yyyy-MM-dd")
                    : null,
                },
              });
            }

            updateProjectTaskListOrder({
              project_id: Number(project_id),
              data: list,
            });
          }
        }
      }}
    >
      <div className="flex size-full min-h-0 gap-x-4">
        {columns.map((column) => (
          <Column key={column.id} id={column.id}>
            {groupedByColumn[column.id]?.map((task, index) => (
              <ProjectSortableTask
                key={task.id}
                id={task.id}
                index={index}
                column={column}
                task={task}
                onClick={() => {
                  onOpenTaskEditSheet(task);
                }}
              />
            ))}
          </Column>
        ))}
        <div className="min-w-9" />
      </div>
    </DragDropProvider>
  );
}

function Column({ children, id }: { children: React.ReactNode; id: string }) {
  const { ref } = useDroppable({
    id,
    type: "column",
    accept: ["item"],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      ref={ref}
      className="flex min-h-full min-w-8/12 flex-1 flex-col gap-2 md:min-w-1/4"
    >
      {children}
    </div>
  );
}

export { ProjectTasks };
