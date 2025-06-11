import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
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
import {
  CategoryField,
  DeadlineDateField,
  NoteField,
  TitleField,
} from "@/shared/ui/goals-fields";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  getGoalsGeneralInfoQueryKey,
  getGoalsQueryKey,
  getTasksQueryKey,
  type GoalDto,
  type TaskDto,
  type UpdateGoalBody,
  useDeleteGoal,
  useUpdateGoal,
} from "@/shared/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import { updateGoalBodySchema } from "@/shared/zod/updateGoalBodySchema";
import { TaskSortableCard } from "@/pages/goals/ui/task-sortable-card";
import { TaskCreateSheet } from "@/pages/goals/ui/task-create-sheet";

function GoalUpdateSheet({
  open,
  goal,
  onOpenChange,
}: {
  open: boolean;
  goal?: GoalDto;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
        <Content goal={goal} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function Content({
  goal,
  onOpenChange,
}: {
  goal?: GoalDto;
  onOpenChange: (open: boolean) => void;
}) {
  const [openTaskCreateSheet, setOpenTaskCreateSheet] =
    useState<boolean>(false);
  const [indexTaskForUpdate, setIndexTaskForUpdate] = useState<number>();

  const form = useForm<UpdateGoalBody>({
    values: {
      title: goal?.title,
      category: goal?.category,
      deadline_date: goal?.deadline_date ?? "",
      note: goal?.note ?? "",
      tasks: goal?.tasks ?? [],
    },
    resolver: zodResolver(updateGoalBodySchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { fields, append, update, move, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
    keyName: "field_id",
  });

  const queryClient = useQueryClient();

  const { mutate: updateGoal, isPending: updateGoalPending } = useUpdateGoal({
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

  const { mutate: deleteGoal, isPending: deleteGoalPending } = useDeleteGoal({
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

  const handleUpdateGoal = async (data: UpdateGoalBody) => {
    if (goal?.id !== undefined)
      updateGoal({
        goal_id: String(goal.id),
        data: {
          title: data.title,
          category: data.category,
          deadline_date: data.deadline_date || null,
          note: data.note || null,
          tasks: data.tasks?.length ? data.tasks : null,
        },
      });
  };

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <SheetTitle>Редактирование цели</SheetTitle>
        <SheetDescription>
          Заполните необходимые поля, чтобы редактировать цель
        </SheetDescription>
      </SheetHeader>

      <div className="scroll flex flex-col gap-y-2 overflow-y-auto px-4">
        <TitleField control={form.control} label="Наименование цели" />
        <CategoryField
          control={form.control}
          label="Категория"
          className="w-full"
        />
        <DeadlineDateField control={form.control} label="Дата окончания цели" />
        <NoteField control={form.control} label="Примечание к цели" />

        <DragDropProvider
          onDragOver={({ operation: { source, target } }) => {
            if (source?.id !== target?.id) {
              const oldIndex = fields.findIndex(
                (f) => f.field_id === source?.id,
              );
              const newIndex = fields.findIndex(
                (f) => f.field_id === target?.id,
              );

              move(oldIndex, newIndex);
            }
          }}
        >
          <div className="flex flex-col gap-y-2">
            <span className="text-sm font-medium">Список задач</span>
            {fields.map((field, index) => (
              <TaskSortableCard
                key={field.field_id}
                id={field.field_id}
                index={index}
                task={field as TaskDto}
                onClick={() => {
                  setIndexTaskForUpdate(index);
                  setOpenTaskCreateSheet(true);
                }}
                onDelete={() => remove(index)}
              />
            ))}

            <Button type="button" onClick={() => setOpenTaskCreateSheet(true)}>
              <Plus />
              Добавить задачу
            </Button>
          </div>

          <TaskCreateSheet
            open={openTaskCreateSheet}
            task={form.getValues(`tasks.${indexTaskForUpdate as number}`)}
            onOpenChange={(value) => setOpenTaskCreateSheet(value)}
            onCreate={(data) => {
              if (indexTaskForUpdate === undefined) {
                append(data);
              }
            }}
            onUpdate={(data) => {
              if (indexTaskForUpdate !== undefined) {
                update(indexTaskForUpdate, data);
                setIndexTaskForUpdate(undefined);
              }
            }}
          />
        </DragDropProvider>
      </div>

      <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
        <div className="flex items-center justify-between gap-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={deleteGoalPending}
                variant="destructive"
                size="icon"
              >
                <Trash2 />
                {deleteGoalPending && <Loader2 className="animate-spin" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Вы действительно хотите удалить цель?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  При удалении цели будут удалены все связанные с ней задачи.
                  Подтвердите удаление цели
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отменить</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteGoal({ goal_id: String(goal?.id) })}
                >
                  Подтвердить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            disabled={updateGoalPending}
            onClick={form.handleSubmit(handleUpdateGoal)}
            className="flex-1"
          >
            <Save />
            {updateGoalPending ? (
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

export { GoalUpdateSheet };
