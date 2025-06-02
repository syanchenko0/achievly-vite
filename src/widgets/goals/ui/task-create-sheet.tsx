import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type GoalBodyTask, goalBodyTaskSchema } from "@/shared/api";
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

function TaskCreateSheet({
  open,
  task,
  onOpenChange,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  task?: GoalBodyTask;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: GoalBodyTask) => void;
  onUpdate?: (data: GoalBodyTask) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
        <Content
          task={task}
          onOpenChange={onOpenChange}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </SheetContent>
    </Sheet>
  );
}

function Content({
  task,
  onOpenChange,
  onCreate,
  onUpdate,
}: {
  task?: GoalBodyTask;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: GoalBodyTask) => void;
  onUpdate?: (data: GoalBodyTask) => void;
}) {
  const form = useForm({
    values: {
      title: task?.title ?? "",
      deadline_date: task?.deadline_date ?? "",
      note: task?.note ?? "",
    },
    resolver: zodResolver(goalBodyTaskSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: GoalBodyTask) => {
    onCreate?.(data);
    onUpdate?.({ ...data, id: task?.id });
    onOpenChange(false);
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <SheetTitle>{task ? "Изменить задачу" : "Добавить задачу"}</SheetTitle>
        <SheetDescription>
          {task
            ? "Заполните необходимые поля, чтобы изменить задачу"
            : "Заполните необходимые поля, чтобы добавить задачу"}
        </SheetDescription>
      </SheetHeader>

      <div className="scroll flex flex-col gap-y-4 overflow-y-auto px-4">
        <TitleField control={form.control} label="Наименование задачи" />
        <DeadlineDateField
          control={form.control}
          label="Дата окончания задачи"
        />
        <NoteField control={form.control} label="Примечание к задаче" />
      </div>

      <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
        <Button onClick={form.handleSubmit(onSubmit)}>Сохранить</Button>
      </SheetFooter>
    </FormProvider>
  );
}

export { TaskCreateSheet };
