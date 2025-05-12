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
import {
  type CreateTeamBodySchema,
  createTeamBodySchema,
  getTeamsByUserIdQueryKey,
  useCreateTeam,
} from "@/shared/api";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { useQueryClient } from "@tanstack/react-query";

type TeamSwitcherDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

function TeamSwitcherDialog({ open, onOpenChange }: TeamSwitcherDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: createTeam, error } = useCreateTeam({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getTeamsByUserIdQueryKey() }),
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

  const handleCloseDialog = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleCreateTeam = async (data: CreateTeamBodySchema) => {
    await createTeam({ data });
    handleCloseDialog();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить команду</DialogTitle>
          <DialogDescription>
            Заполните обязательные поля для отправки запроса на создание команды
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
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
                onClick={handleCloseDialog}
              >
                Отменить
              </Button>
              <Button type="submit">Отправить</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { TeamSwitcherDialog };
