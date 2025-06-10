import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Loader2 } from "lucide-react";
import {
  type CreateProjectBodySchema,
  createProjectBodySchema,
  type ShortInfoProjectDto,
  getProjectsQueryKey,
  useCreateProject,
  getTeamQueryKey,
} from "@/shared/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useQueryClient } from "@tanstack/react-query";

function ProjectsGroupDialog({
  team_id,
  open,
  onOpenChange,
}: {
  team_id: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content team_id={team_id} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  team_id,
  onOpenChange,
}: {
  team_id: string;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { mutateAsync: createProject, isPending: createProjectPending } =
    useCreateProject({
      mutation: {
        onSettled: async (newProject) => {
          await queryClient.cancelQueries({
            queryKey: getProjectsQueryKey({ team_id }),
          });

          const previousProjects = queryClient.getQueryData<
            ShortInfoProjectDto[]
          >(getProjectsQueryKey({ team_id }));

          queryClient.setQueryData(getProjectsQueryKey({ team_id }), [
            ...(previousProjects || []),
            newProject,
          ]);

          queryClient
            .invalidateQueries({
              queryKey: getTeamQueryKey({ team_id }),
            })
            .then();

          onOpenChange(false);
          form.reset();

          return { previousProjects };
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
    onOpenChange(false);
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

export { ProjectsGroupDialog };
