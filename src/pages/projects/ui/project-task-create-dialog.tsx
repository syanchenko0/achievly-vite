import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import {
  type CreateProjectTaskBody,
  getProjectQueryKey,
  type ProjectColumn,
  type ProjectDto,
  useCreateProjectTask,
} from "@/shared/api";
import { PROJECT_TASK_PRIORITY } from "@/shared/constants/projects";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import {
  DeadlineDateField,
  DescriptionField,
  ExecutorField,
  NameField,
  PriorityField,
} from "@/shared/ui/projects-fields";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

function ProjectTaskCreateDialog({
  open,
  column,
  onOpenChange,
}: {
  open: boolean;
  column: ProjectColumn;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content column={column} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  column,
  onOpenChange,
}: {
  column: ProjectColumn;
  onOpenChange: (value: boolean) => void;
}) {
  const { project_id } = useParams<{ project_id: string }>();

  const form = useForm<CreateProjectTaskBody>({
    defaultValues: {
      name: "",
      description: "",
      priority: PROJECT_TASK_PRIORITY.LOW,
      column,
    },
  });

  const queryClient = useQueryClient();

  const { mutate: createProjectTask, isPending: createProjectTaskPending } =
    useCreateProjectTask({
      mutation: {
        onSettled: async (newProjectTask) => {
          await queryClient.cancelQueries({
            queryKey: getProjectQueryKey({
              project_id: project_id as string,
            }),
          });

          const previousProjectData = queryClient.getQueryData<ProjectDto>(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
          );

          queryClient.setQueryData(
            getProjectQueryKey({
              project_id: project_id as string,
            }),
            {
              ...previousProjectData,
              project_tasks: [
                ...(previousProjectData?.project_tasks ?? []),
                newProjectTask,
              ],
            },
          );

          onOpenChange(false);
          form.reset();

          return { previousProjectData };
        },
      },
    });

  const handleCreateProjectTask = async (data: CreateProjectTaskBody) => {
    createProjectTask({ data, project_id: Number(project_id) });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleCreateProjectTask)}
        className="flex flex-col gap-y-4"
      >
        <DialogHeader>
          <DialogTitle>Создать задачу</DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы создать задачу
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-y-4">
          <NameField control={form.control} label="Наименование" />
          <PriorityField
            control={form.control}
            label="Приоритет"
            className="w-full"
          />
          <ExecutorField
            control={form.control}
            label="Исполнитель"
            className="w-full"
          />
          <DeadlineDateField control={form.control} label="Дата дедлайна" />
          <DescriptionField control={form.control} label="Описание" />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={createProjectTaskPending}>
            {createProjectTaskPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Создать"
            )}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

export { ProjectTaskCreateDialog };
