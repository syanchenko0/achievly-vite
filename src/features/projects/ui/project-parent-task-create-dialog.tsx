import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";

import { useProjectParentTaskQueries } from "@/features/projects/hooks/use-project-parent-task-queries";
import type { CreateProjectParentTaskBody } from "@/shared/api";
import { useParams } from "react-router";
import { createProjectParentTaskBodySchema } from "@/shared/zod/projects/createProjectParentTaskBodySchema";
import {
  DeadlineDateField,
  DescriptionField,
  NameField,
} from "@/shared/ui/projects-fields";

function ProjectParentTaskCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function Content({ onOpenChange }: { onOpenChange: (value: boolean) => void }) {
  const { project_id } = useParams<{ project_id: string }>();

  const { createProjectParentTask, createProjectParentTaskPending } =
    useProjectParentTaskQueries();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      deadline_date: "",
    },
    resolver: zodResolver(createProjectParentTaskBodySchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const onSubmit = async (data: CreateProjectParentTaskBody) => {
    await createProjectParentTask({
      data,
      project_id: Number(project_id),
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Создание родительской задачи</DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы создать родительскую задачу
          </DialogDescription>
        </DialogHeader>

        <NameField control={form.control} label="Наименование" />
        <DeadlineDateField
          control={form.control}
          label="Дата окончания задачи"
        />
        <DescriptionField control={form.control} label="Описание" />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="reset" variant="destructive">
              Отменить
            </Button>
          </DialogClose>
          <Button type="submit" disabled={createProjectParentTaskPending}>
            {createProjectParentTaskPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Создать"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export { ProjectParentTaskCreateDialog };
