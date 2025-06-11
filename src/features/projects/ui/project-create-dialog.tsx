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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { useProjectsQueries } from "@/features/projects/hooks/use-projects-queries";
import { useTeamSettingsStore } from "@/app/store/team";
import {
  type CreateProjectBodySchema,
  createProjectBodySchema,
} from "@/shared/zod/createProjectBodySchema";

function ProjectCreateDialog({
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
  const team_id = useTeamSettingsStore((state) => state.activeTeamId);

  const { createProject, createProjectPending } = useProjectsQueries();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createProjectBodySchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const onSubmit = async (data: CreateProjectBodySchema) => {
    await createProject({ data, params: { team_id: team_id as string } });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Создание проекта</DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы создать проект
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Наименование проекта</FormLabel>
              <FormControl>
                <Input placeholder="Введите наименование" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="reset" variant="destructive">
              Отменить
            </Button>
          </DialogClose>
          <Button type="submit" disabled={createProjectPending}>
            {createProjectPending ? (
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

export { ProjectCreateDialog };
