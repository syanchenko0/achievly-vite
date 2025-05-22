import { useForm } from "react-hook-form";
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
import type { Dispatch, SetStateAction } from "react";
import { Form } from "@/shared/ui/form";
import { TaskForm } from "@/widgets/goals/ui/task-form";

function TaskUpdateSheet({
  task,
  open,
  setOpen,
  onUpdate,
}: {
  task: GoalBodyTask;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onUpdate: (data: GoalBodyTask) => void;
}) {
  const form = useForm({
    defaultValues: task,
    resolver: zodResolver(goalBodyTaskSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  console.log({ task });

  const onSubmit = async (data: GoalBodyTask) => {
    onUpdate(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
          <SheetHeader>
            <SheetTitle>Изменить задачу</SheetTitle>
            <SheetDescription>
              Заполните необходимые поля, чтобы изменить задачу
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <TaskForm />
          </div>
          <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              Изменить задачу
            </Button>
          </SheetFooter>
        </SheetContent>
      </Form>
    </Sheet>
  );
}

export { TaskUpdateSheet };
