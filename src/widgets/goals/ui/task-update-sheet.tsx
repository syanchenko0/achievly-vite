import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getGoalsGeneralInfoQueryKey,
  getGoalsQueryKey,
  getTasksQueryKey,
  type GoalBodyTask,
  goalBodyTaskSchema,
  type TaskDto,
  useDeleteTask,
  useUpdateTask,
} from "@/shared/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import {
  DeadlineDateField,
  NoteField,
  TitleField,
} from "@/shared/ui/goals-fields";
import { useQueryClient } from "@tanstack/react-query";
import { InfoIcon, Loader2, Save, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
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

function TaskUpdateSheet({
  open,
  task,
  onOpenChange,
}: {
  open: boolean;
  task?: TaskDto;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
        <Content task={task} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function Content({
  task,
  onOpenChange,
}: {
  task?: TaskDto;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<GoalBodyTask>({
    values: {
      title: task?.title ?? "",
      deadline_date: task?.deadline_date ?? "",
      note: task?.note ?? "",
    },
    resolver: zodResolver(goalBodyTaskSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const queryClient = useQueryClient();

  const { mutate: updateTask, isPending: updateTaskPending } = useUpdateTask({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGoalsGeneralInfoQueryKey(),
        });

        queryClient
          .invalidateQueries({ queryKey: getGoalsQueryKey() })
          .then(() => {
            onOpenChange(false);
            form.reset();
          });

        queryClient.invalidateQueries({ queryKey: getTasksQueryKey() }).then();
      },
    },
  });

  const { mutate: deleteTask, isPending: deleteTaskPending } = useDeleteTask({
    mutation: {
      onMutate: async (deleted) => {
        await queryClient.invalidateQueries({
          queryKey: getGoalsGeneralInfoQueryKey(),
        });

        await queryClient.cancelQueries({ queryKey: getTasksQueryKey() });
        const previousTasks =
          queryClient.getQueryData<TaskDto[]>(getTasksQueryKey());
        queryClient.setQueryData<TaskDto[]>(
          getTasksQueryKey(),
          previousTasks?.filter((task) => task.id !== Number(deleted.task_id)),
        );
        onOpenChange(false);
        form.reset();
        return { previousTasks };
      },
    },
  });

  const onSubmit = async (data: GoalBodyTask) => {
    if (task?.id !== undefined)
      updateTask({
        task_id: String(task.id),
        data: { ...data, id: task.id },
      });
  };

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <SheetTitle>Изменить задачу</SheetTitle>
        <SheetDescription>
          Заполните необходимые поля, чтобы изменить задачу
        </SheetDescription>
      </SheetHeader>

      <div className="scroll flex flex-col gap-y-2 overflow-y-auto px-4">
        {task?.goal && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Задача относится к цели: {task.goal.title}</AlertTitle>
            <AlertDescription>
              <Link
                to={`${ROUTES.goals_list}?goal_id=${task.goal.id}`}
                className="font-medium underline transition-colors hover:text-sky-600"
              >
                Перейти к цели
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <TitleField control={form.control} label="Наименование задачи" />
        <DeadlineDateField
          control={form.control}
          label="Дата окончания задачи"
        />
        <NoteField control={form.control} label="Примечание к задаче" />
      </div>

      <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
        <div className="flex items-center justify-between gap-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={deleteTaskPending}
                variant="destructive"
                size="icon"
              >
                <Trash2 />
                {deleteTaskPending && <Loader2 className="animate-spin" />}
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
                  onClick={() => deleteTask({ task_id: String(task?.id) })}
                >
                  Подтвердить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            disabled={updateTaskPending}
            onClick={form.handleSubmit(onSubmit)}
            className="flex-1"
          >
            <Save />
            {updateTaskPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Сохранить изменения"
            )}
          </Button>
        </div>
      </SheetFooter>
    </FormProvider>
  );
}

export { TaskUpdateSheet };
