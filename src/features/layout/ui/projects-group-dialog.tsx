import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { SidebarGroupAction } from "@/shared/ui/sidebar";
import { Loader2, Plus } from "lucide-react";
import {
  type CreateProjectBodySchema,
  createProjectBodySchema,
  getTeamsQueryKey,
  useCreateProject,
} from "@/shared/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function ProjectsGroupDialog({ team_id }: { team_id: string }) {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { mutateAsync: createProject, isPending: createProjectPending } =
    useCreateProject({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getTeamsQueryKey() });
        },
      },
    });

  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createProjectBodySchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const onSubmit = async (data: CreateProjectBodySchema) => {
    await createProject({ data, params: { team_id } });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction
          title="Добавить проект"
          className="cursor-pointer rounded-sm"
        >
          <Plus />
          <span className="sr-only">Добавить проект</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создание проекта</DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы создать проект
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}

export { ProjectsGroupDialog };
