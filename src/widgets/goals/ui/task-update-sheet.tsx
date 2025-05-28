import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getTasksQueryKey,
  type GoalBodyTask,
  goalBodyTaskSchema,
  type TaskDto,
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
import { InfoIcon, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

function TaskUpdateSheet({
  open,
  task,
  onOpenChange,
}: {
  open: boolean;
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
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getTasksQueryKey() })
          .then(() => {
            onOpenChange(false);
            form.reset();
          });
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
    <Sheet
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        form.reset();
      }}
    >
      <FormProvider {...form}>
        <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
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
                <AlertTitle>
                  Задача относится к цели: {task.goal.title}
                </AlertTitle>
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
            <Button
              disabled={updateTaskPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {updateTaskPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </FormProvider>
    </Sheet>
  );
}

export { TaskUpdateSheet };
