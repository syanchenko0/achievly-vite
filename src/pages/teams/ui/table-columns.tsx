import {
  getTeamQueryKey,
  type ProjectRightsDto,
  type UpdateTeamMemberBodySchema,
  updateTeamMemberBodySchema,
  useDeleteTeamMember,
  useUpdateTeamMember,
} from "@/shared/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Loader2, Settings, UserX } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { type Dispatch, type SetStateAction, useState } from "react";
import { MEMBER_ROLES, MEMBER_ROLES_LABELS } from "@/shared/constants/teams";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { useQueryClient } from "@tanstack/react-query";

const ActionsCell = ({
  member_id,
  team_id,
  member_role,
  user_role,
  projects_rights,
}: {
  member_id: number;
  team_id: number;
  member_role: string;
  user_role: string;
  projects_rights?: ProjectRightsDto[];
}) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean>(false);

  const { mutateAsync: deleteTeamMember, isPending: deleteTeamMemberPending } =
    useDeleteTeamMember({
      mutation: {
        onSuccess: () => {
          queryClient
            .invalidateQueries({
              queryKey: getTeamQueryKey({ team_id: String(team_id) }),
            })
            .then();
        },
      },
    });

  const isMemberOwner = member_role === MEMBER_ROLES.owner;

  const isUserAdmin = user_role === MEMBER_ROLES.admin;

  const isUserMember = user_role === MEMBER_ROLES.member;

  const handleDeleteTeamMember = async () => {
    await deleteTeamMember({
      member_id: String(member_id),
      team_id: String(team_id),
    });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  if (isMemberOwner || isUserMember) return null;

  return (
    <div className="flex justify-end gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={handleOpenDialog}>
              <Settings />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Редактировать права</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isUserAdmin && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => setAlertDialogOpen(true)}
                  disabled={deleteTeamMemberPending}
                >
                  {deleteTeamMemberPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <UserX />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Исключить из команды
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Исключить участника</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите исключить участника из команды?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отменить</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTeamMember}>
                  Подтвердить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ActionsCellDialog
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
            projects_rights={projects_rights}
            member_role={member_role}
            member_id={String(member_id)}
            team_id={String(team_id)}
          />
        </>
      )}
    </div>
  );
};

const ActionsCellDialog = ({
  openDialog,
  projects_rights,
  member_role,
  team_id,
  member_id,
  setOpenDialog,
}: {
  openDialog: boolean;
  projects_rights?: ProjectRightsDto[];
  member_role: string;
  team_id: string;
  member_id: string;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateTeamMember, isPending: updateTeamMemberPending } =
    useUpdateTeamMember({
      mutation: {
        onSuccess: () => {
          queryClient
            .invalidateQueries({ queryKey: getTeamQueryKey({ team_id }) })
            .then(() => setOpenDialog(false));
        },
      },
    });

  const form = useForm({
    defaultValues: {
      role: member_role,
      projects_rights,
    },
    resolver: zodResolver(updateTeamMemberBodySchema),
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "projects_rights",
  });

  const handleUpdateTeamMember = async (data: UpdateTeamMemberBodySchema) => {
    await updateTeamMember({ team_id, member_id, data });
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование прав</DialogTitle>
          <DialogDescription>
            Вы можете изменить роль участника и его права для каждого проекта,
            который существует в команде
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdateTeamMember)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={MEMBER_ROLES.admin}>
                            {MEMBER_ROLES_LABELS.admin}
                          </SelectItem>
                          <SelectItem value={MEMBER_ROLES.member}>
                            {MEMBER_ROLES_LABELS.member}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion
              type="single"
              collapsible
              className="flex w-full flex-col gap-y-2"
            >
              {fields.map((field, index) => (
                <AccordionItem
                  key={field.id}
                  value={field.id}
                  className="rounded-md border border-b px-2 last:border-b"
                >
                  <AccordionTrigger>{field.project_name}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-y-2">
                    <FormField
                      control={form.control}
                      name={`projects_rights.${index}.create`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Создание</FormLabel>
                            <FormDescription>
                              Право на создание задач в проекте
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects_rights.${index}.read`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Чтение</FormLabel>
                            <FormDescription>
                              Право на чтение данных проекта, отображение
                              проекта в списке проектов участника
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects_rights.${index}.update`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Редактирование</FormLabel>
                            <FormDescription>
                              Право на редактирование задач в проекте
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects_rights.${index}.delete`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Удаление</FormLabel>
                            <FormDescription>
                              Право на удаление задач в проекте
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="reset" variant="destructive">
                  Отменить
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updateTeamMemberPending}>
                {updateTeamMemberPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Сохранить"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { ActionsCell };
