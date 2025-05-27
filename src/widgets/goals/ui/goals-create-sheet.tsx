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
import { GoalForm } from "@/widgets/goals/ui/goal-form";
import { Form } from "@/shared/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateGoalBodySchema,
  createGoalBodySchema,
  useCreateGoal,
} from "@/shared/api";
import { Loader2 } from "lucide-react";

function GoalsCreateSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { mutateAsync: createGoal, isPending: createGoalPending } =
    useCreateGoal();

  const form = useForm({
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

  const handleCreateGoal = async (data: CreateGoalBodySchema) => {
    await createGoal({
      data: {
        title: data.title,
        category: data.category,
        deadline_date: data.deadline_date ? data.deadline_date : undefined,
        note: data.note ? data.note : undefined,
        tasks: data.tasks?.length ? data.tasks : undefined,
      },
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        form.reset();
      }}
    >
      <Form {...form}>
        <SheetContent className="w-[400px] sm:w-[580px] sm:max-w-[580px]">
          <form
            onSubmit={form.handleSubmit(handleCreateGoal)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Создать цель</SheetTitle>
              <SheetDescription>
                Заполните необходимые поля, чтобы создать цель
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <GoalForm />
            </div>
            <SheetFooter className="bg-background sticky bottom-0 w-full pb-6">
              <Button type="submit" disabled={createGoalPending}>
                {createGoalPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Создать цель"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Form>
    </Sheet>
  );
}

export { GoalsCreateSheet };
