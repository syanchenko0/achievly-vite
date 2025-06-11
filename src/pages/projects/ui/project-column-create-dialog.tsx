import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useParams } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { useProjectQueries } from "@/pages/projects/hooks/use-project-queries";
import {
  FinalStageField,
  NameField,
  RemovableField,
  TaskCreationAllowedField,
} from "@/shared/ui/projects-fields";
import { Button } from "@/shared/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { CreateProjectColumnBody } from "@/shared/api";
import { createProjectColumnBodySchema } from "@/shared/zod/createProjectColumnBodySchema";

function ProjectColumnCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProjectColumnCreateDialogContent onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function ProjectColumnCreateDialogContent({
  onOpenChange,
}: {
  onOpenChange: (value: boolean) => void;
}) {
  const { project_id } = useParams<{ project_id: string }>();

  const form = useForm<CreateProjectColumnBody>({
    defaultValues: {
      name: "",
      is_removable: true,
      is_task_creation_allowed: false,
      is_final_stage: false,
    },
    resolver: zodResolver(createProjectColumnBodySchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const { createProjectColumn, createProjectColumnPending } =
    useProjectQueries();

  const handleCreateProjectColumn = async (data: CreateProjectColumnBody) => {
    await createProjectColumn({
      project_id: Number(project_id),
      data,
    });
    onOpenChange(false);
  };

  return (
    <FormProvider {...form}>
      <DialogHeader>
        <DialogTitle>Добавить столбец</DialogTitle>
        <DialogDescription>
          Заполните необходимые поля, чтобы добавить столбец
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-y-4">
        <NameField control={form.control} label="Наименование столбца" />
        <RemovableField
          control={form.control}
          label="Признак удаления"
          description="При включенном признаке столбец может быть удален, если у пользователя есть соответствующие права"
        />
        <TaskCreationAllowedField
          control={form.control}
          label="Признак способности создания задачи"
          description="При включенном признаке в столбце можно создавать задачи"
        />
        <FinalStageField
          control={form.control}
          label="Признак конечного столбца"
          description="При включенном признаке столбец является конечной точкой задачи. При попадании в этот столбец задача завершается"
        />
      </div>

      <DialogFooter>
        <Button
          disabled={createProjectColumnPending}
          onClick={form.handleSubmit(handleCreateProjectColumn)}
        >
          {createProjectColumnPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Добавить"
          )}
        </Button>
      </DialogFooter>
    </FormProvider>
  );
}

export { ProjectColumnCreateDialog };
