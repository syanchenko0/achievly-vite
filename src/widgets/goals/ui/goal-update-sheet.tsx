import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  CategoryField,
  DeadlineDateField,
  NoteField,
  TitleField,
} from "@/shared/ui/goals-fields";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  getGoalsQueryKey,
  type GoalDto,
  type TaskDto,
  type UpdateGoalBody,
  updateGoalBodySchema,
  useDeleteGoal,
  useUpdateGoal,
} from "@/shared/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { TaskSortableCard } from "@/widgets/goals/ui/task-sortable-card";
import { TaskCreateSheet } from "@/widgets/goals/ui/task-create-sheet";
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";

function GoalUpdateSheet({
  open,
  goal,
  onOpenChange,
}: {
  open: boolean;
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

  const { fields, append, update, move } = useFieldArray({
    control: form.control,
    name: "tasks",
    keyName: "field_id",
  });

  const queryClient = useQueryClient();

  const { mutate: updateGoal, isPending: updateGoalPending } = useUpdateGoal({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getGoalsQueryKey() })
          .then(() => {
            onOpenChange(false);
            form.reset();
          });
      },
    },
  });

  const { mutate: deleteGoal, isPending: deleteGoalPending } = useDeleteGoal({
    mutation: {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: getGoalsQueryKey() })
          .then(() => {
            onOpenChange(false);
            form.reset();
          });
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
            <DeadlineDateField
              control={form.control}
              label="Дата окончания цели"
            />
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
                  />
                ))}

                <Button
                  type="button"
                  onClick={() => setOpenTaskCreateSheet(true)}
                >
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
            <Button
              disabled={deleteGoalPending}
              variant="destructive"
              onClick={() => deleteGoal({ goal_id: String(goal?.id) })}
            >
              {deleteGoalPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Удалить цель"
              )}
            </Button>
            <Button
              disabled={updateGoalPending}
              onClick={form.handleSubmit(handleUpdateGoal)}
            >
              {updateGoalPending ? (
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

export { GoalUpdateSheet };
