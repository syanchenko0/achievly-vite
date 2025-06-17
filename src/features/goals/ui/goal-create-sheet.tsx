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
  type CreateGoalBody,
  getGoalsGeneralInfoQueryKey,
  getGoalsQueryKey,
  getTasksQueryKey,
  type TaskDto,
  useCreateGoal,
} from "@/shared/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import { createGoalBodySchema } from "@/shared/zod/createGoalBodySchema";
import { TaskSortableCard } from "@/pages/goals/ui/task-sortable-card";
import { TaskCreateSheet } from "@/pages/goals/ui/task-create-sheet";

function GoalCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
        <Content onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function Content({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [openTaskCreateSheet, setOpenTaskCreateSheet] =
    useState<boolean>(false);
  const [indexTaskForUpdate, setIndexTaskForUpdate] = useState<number>();

  const form = useForm<CreateGoalBody>({
    defaultValues: {
      title: "",
      category: "",
      deadline_date: "",
      note: "",
      tasks: [],
    },
    resolver: zodResolver(createGoalBodySchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { fields, append, update, move } = useFieldArray({
    control: form.control,
    name: "tasks",
    keyName: "field_id",
  });

  const queryClient = useQueryClient();

  const { mutate: createGoal, isPending: createGoalPending } = useCreateGoal({
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

  const handleCreateGoal = async (data: CreateGoalBody) => {
    createGoal({
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
        <SheetTitle>Создание цели</SheetTitle>
        <SheetDescription>
          Заполните необходимые поля, чтобы создать цель
        </SheetDescription>
      </SheetHeader>

      <div className="scroll flex flex-col gap-y-4 overflow-y-auto px-4">
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
                error={
                  !field?.done_date
                    ? form.formState.errors?.tasks?.[index]?.deadline_date
                        ?.message
                    : undefined
                }
                onClick={() => {
                  setIndexTaskForUpdate(index);
                  setOpenTaskCreateSheet(true);
                }}
              />
            ))}

            <Button type="button" onClick={() => setOpenTaskCreateSheet(true)}>
              <Plus />
              Добавить задачу
            </Button>
          </div>

          <TaskCreateSheet
            open={openTaskCreateSheet}
            onOpenChange={(value) => {
              setOpenTaskCreateSheet(value);
              setIndexTaskForUpdate(undefined);
            }}
            task={form.getValues(`tasks.${indexTaskForUpdate as number}`)}
            goalDeadlineDate={form.getValues("deadline_date")}
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
          disabled={createGoalPending || !form.formState.isValid}
          onClick={form.handleSubmit(handleCreateGoal)}
        >
          {createGoalPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Создать цель"
          )}
        </Button>
      </SheetFooter>
    </FormProvider>
  );
}

export { GoalCreateSheet };
