import type { ProjectColumn } from "@/shared/api";
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
import { Loader2 } from "lucide-react";

function ProjectColumnEditDialog({
  column,
  open,
  onOpenChange,
}: {
  column?: ProjectColumn;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {column && (
          <ProjectColumnEditDialogContent
            column={column}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectColumnEditDialogContent({
  column,
  onOpenChange,
}: {
  column: ProjectColumn;
  onOpenChange: (value: boolean) => void;
}) {
  const { project_id } = useParams<{ project_id: string }>();

  const form = useForm<ProjectColumn>({
    defaultValues: { ...column },
  });

  const { updateProjectColumn, updateProjectColumnPending } =
    useProjectQueries();

  const handleUpdateProjectColumn = async (data: ProjectColumn) => {
    await updateProjectColumn({
      column_id: column.id,
      project_id: Number(project_id),
      data,
    });
    onOpenChange(false);
  };

  return (
    <FormProvider {...form}>
      <DialogHeader>
        <DialogTitle>Редактировать столбец</DialogTitle>
        <DialogDescription>
          Заполните необходимые поля, чтобы редактировать столбец
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
        <Button variant="destructive" onClick={() => onOpenChange(false)}>
          Закрыть
        </Button>
        <Button
          onClick={form.handleSubmit(handleUpdateProjectColumn)}
          disabled={updateProjectColumnPending}
        >
          {updateProjectColumnPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Сохранить"
          )}
        </Button>
      </DialogFooter>
    </FormProvider>
  );
}

export { ProjectColumnEditDialog };
