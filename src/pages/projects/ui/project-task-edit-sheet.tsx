import {
  type ProjectTaskDto,
  type UpdateProjectTaskBody,
  updateProjectTaskBodySchema,
} from "@/shared/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import {
  AuthorField,
  DeadlineDateField,
  DescriptionField,
  ExecutorField,
  NameField,
  PriorityField,
} from "@/shared/ui/projects-fields";
import { useParams } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";

function ProjectTaskEditSheet({
  task,
  open,
  onOpenChange,
}: {
  task?: ProjectTaskDto;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
        {task && (
          <ProjectTaskEditSheetContent
            task={task}
            onOpenChange={onOpenChange}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProjectTaskEditSheetContent({
  task,
  onOpenChange,
}: {
  task: ProjectTaskDto;
  onOpenChange: (value: boolean) => void;
}) {
  const { project_id } = useParams<{ project_id: string }>();

  const form = useForm<UpdateProjectTaskBody>({
    defaultValues: { ...task, executor_member_id: task.executor?.id },
    resolver: zodResolver(updateProjectTaskBodySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const {
    updateProjectTask,
    updateProjectTaskPending,
    deleteProjectTask,
    deleteProjectTaskPending,
  } = useProjectQueries();

  const handleUpdateProjectTask = async (data: UpdateProjectTaskBody) => {
    updateProjectTask({
      task_id: task.id,
      project_id: Number(project_id),
      data: {
        ...data,
        priority: data.priority === "null" ? null : data.priority,
      },
    });
    onOpenChange(false);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdateProjectTask)}
        className="flex h-full flex-col gap-y-4"
      >
        <SheetHeader>
          <SheetTitle>Редактировать задачу</SheetTitle>
          <SheetDescription>
            Заполните или измените содержимое полей, чтобы редактировать задачу
          </SheetDescription>
        </SheetHeader>

        <div className="scroll flex flex-col gap-y-4 overflow-y-auto px-4">
          <NameField control={form.control} label="Наименование" />
          <PriorityField
            control={form.control}
            label="Приоритет"
            className="w-full"
          />
          <AuthorField
            control={form.control}
            label="Автор"
            className="w-full"
            disabled
          />
          <ExecutorField
            control={form.control}
            label="Исполнитель"
            className="w-full"
          />
          <DeadlineDateField control={form.control} label="Дата дедлайна" />
          <DescriptionField control={form.control} label="Описание" />
        </div>

        <SheetFooter className="bg-background sticky bottom-0 w-full pr-6 pb-6">
          <div className="flex items-center justify-between gap-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={deleteProjectTaskPending}
                  variant="destructive"
                  size="icon"
                >
                  <Trash2 />
                  {deleteProjectTaskPending && (
                    <Loader2 className="animate-spin" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Вы действительно хотите удалить задачу?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    После удаления задача не будет восстановлена. Подтвердите
                    действие
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отменить</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      deleteProjectTask({
                        task_id: task.id,
                        project_id: project_id as string,
                      });
                      onOpenChange(false);
                    }}
                  >
                    Подтвердить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              disabled={updateProjectTaskPending}
              className="flex-1"
            >
              <Save />
              {updateProjectTaskPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}

export { ProjectTaskEditSheet };
