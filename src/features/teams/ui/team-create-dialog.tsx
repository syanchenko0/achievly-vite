import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import type { Dispatch, SetStateAction } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTeamsQueryKey, useCreateTeam } from "@/shared/api";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import {
  createTeamBodySchema,
  type CreateTeamBodySchema,
} from "@/shared/zod/createTeamBodySchema";

type TeamCreateDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

function TeamCreateDialog({ open, onOpenChange }: TeamCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function Content({ onOpenChange }: { onOpenChange: (value: boolean) => void }) {
  const queryClient = useQueryClient();

  const { mutateAsync: createTeam, error } = useCreateTeam({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getTeamsQueryKey() }),
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createTeamBodySchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const handleCreateTeam = async (data: CreateTeamBodySchema) => {
    await createTeam({ data });
    onOpenChange(false);
  };

  return (
    <FormProvider {...form}>
      <DialogHeader>
        <DialogTitle>Добавить команду</DialogTitle>
        <DialogDescription>
          Заполните обязательные поля для отправки запроса на создание команды
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit((data) => {
          handleCreateTeam(data).then();
        })}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Наименование команды" {...field} />
              </FormControl>
              <FormMessage />
              <FormMessage>{error?.response?.data?.message}</FormMessage>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="reset"
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Отменить
          </Button>
          <Button type="submit">Отправить</Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}

export { TeamCreateDialog };
