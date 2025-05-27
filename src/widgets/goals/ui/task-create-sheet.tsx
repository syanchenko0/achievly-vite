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

function TaskCreateSheet({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onCreate: (data: GoalBodyTask) => void;
}) {
  const form = useForm({
    defaultValues: { title: "", deadline_date: "", note: "" },
    resolver: zodResolver(goalBodyTaskSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: GoalBodyTask) => {
    onCreate(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
          <SheetHeader>
            <SheetTitle>Добавить задачу</SheetTitle>
            <SheetDescription>
              Заполните необходимые поля, чтобы добавить задачу
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <TaskForm />
          </div>
          <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              Создать задачу
            </Button>
          </SheetFooter>
        </SheetContent>
      </Form>
    </Sheet>
  );
}

export { TaskCreateSheet };
