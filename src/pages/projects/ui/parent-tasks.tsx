import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectParentTaskSchema } from "@/shared/zod/projects/updateProjectParentTaskSchema";
import { Form } from "@/shared/ui/form";
import {
  DeadlineDateField,
  DescriptionField,
  NameField,
} from "@/shared/ui/projects-fields";
import type {
  ProjectParentTaskDto,
  ProjectTaskDto,
  UpdateProjectParentTaskBody,
} from "@/shared/api";
import { useProjectParentTaskQueries } from "@/features/projects/hooks/use-project-parent-task-queries";
import { useParams } from "react-router";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  PROJECT_TASK_PRIORITY,
  PROJECT_TASK_PRIORITY_LABELS,
} from "@/shared/constants/projects";
import { cn } from "@/app/lib/utils";
import { ProjectTaskEditSheet } from "@/pages/projects/ui/project-task-edit-sheet";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function ParentTasks() {
  const [openTaskEditSheet, setOpenTaskEditSheet] = useState<boolean>(false);

  const [taskForUpdate, setTaskForUpdate] = useState<ProjectTaskDto>();

  const { project, projectLoading, projectError } = useProjectQueries();

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
    <div className="bg-sidebar size-full max-h-full rounded-md border p-4">
      {!project?.project_parent_tasks?.length && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Родительские задачи отсутствуют</AlertTitle>
          <AlertDescription>
            Добавьте родительские задачи, чтобы увидеть их на этой странице
          </AlertDescription>
        </Alert>
      )}
      {!!project?.project_parent_tasks?.length && (
        <Accordion
          type="single"
          collapsible
          className="flex flex-col gap-y-2 border-b-0"
        >
          {project?.project_parent_tasks?.map((parent_task) => (
            <AccordionItem
              key={parent_task.id}
              value={String(parent_task.id)}
              className="rounded-md border px-4 last:border-b"
            >
              <AccordionTrigger>{parent_task.name}</AccordionTrigger>
              <Content
                parent_task={parent_task}
                onOpenTaskEditSheet={(task) => {
                  setTaskForUpdate({ ...task, parent_task });
                  setOpenTaskEditSheet(true);
                }}
              />
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ProjectTaskEditSheet
        task={taskForUpdate}
        open={openTaskEditSheet}
        onOpenChange={(value) => {
          setOpenTaskEditSheet(value);
        }}
      />
    </div>
  );
}

function Content({
  parent_task,
  onOpenTaskEditSheet,
}: {
  parent_task: ProjectParentTaskDto;
  onOpenTaskEditSheet: (task: ProjectTaskDto) => void;
}) {
  const { project_id } = useParams<{
    project_id: string;
  }>();

  const form = useForm({
    defaultValues: {
      name: parent_task?.name ?? "",
      description: parent_task?.description ?? "",
      deadline_date: parent_task?.deadline_date ?? "",
      project_task_ids:
        parent_task?.project_tasks?.map((task) => task.id) ?? [],
    },
    resolver: zodResolver(updateProjectParentTaskSchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { updateProjectParentTask, updateProjectParentTaskPending } =
    useProjectParentTaskQueries();

  const onSubmit = async (data: UpdateProjectParentTaskBody) => {
    await updateProjectParentTask({
      data,
      project_id: Number(project_id),
      parent_task_id: Number(parent_task.id),
    });
  };

  return (
    <AccordionContent>
      <div className="flex flex-col gap-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <NameField control={form.control} label="Наименование" />
            <DeadlineDateField
              control={form.control}
              label="Дата окончания задачи"
            />

            <Accordion type="multiple">
              <AccordionItem
                value="tasks"
                className="rounded-md border px-4 last:border-b"
              >
                <AccordionTrigger>Прикрепленные задачи</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead>Приоритет</TableHead>
                        <TableHead>Исполнитель</TableHead>
                        <TableHead>Дата завершения задачи</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parent_task?.project_tasks?.map((task) => (
                        <TableRow
                          key={task.id}
                          className="cursor-pointer"
                          onClick={() => onOpenTaskEditSheet(task)}
                        >
                          <TableCell className="items-center">
                            {task.name}
                          </TableCell>
                          <TableCell>
                            {task.priority && (
                              <span
                                className={cn("", {
                                  "text-green-500":
                                    task.priority === PROJECT_TASK_PRIORITY.LOW,
                                  "text-yellow-400":
                                    task.priority ===
                                    PROJECT_TASK_PRIORITY.MEDIUM,
                                  "text-red-500":
                                    task.priority ===
                                      PROJECT_TASK_PRIORITY.HIGH ||
                                    task.priority ===
                                      PROJECT_TASK_PRIORITY.CRITICAL,
                                })}
                              >
                                {
                                  PROJECT_TASK_PRIORITY_LABELS[
                                    task.priority as keyof typeof PROJECT_TASK_PRIORITY
                                  ]
                                }
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{task.executor?.user?.username}</TableCell>
                          <TableCell>
                            {task.deadline_date
                              ? format(new Date(task.deadline_date), "PPP", {
                                  locale: ru,
                                })
                              : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <DescriptionField control={form.control} label="Описание" />

            <div className="flex justify-end gap-x-2">
              <Button type="submit" disabled={updateProjectParentTaskPending}>
                {updateProjectParentTaskPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Сохранить
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AccordionContent>
  );
}

export { ParentTasks };
