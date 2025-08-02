import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import type { BudgetItemFormValues } from "@/features/budget/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBudgetItemSchema } from "@/features/budget/model/validation";
import { DatePickerField, InputField } from "@/features/budget/ui/form-fields";
import {
  useCreateMutation,
  useDeleteMutation,
  useUpdateMutation,
} from "@/features/budget/api";
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
import { endOfMonth, startOfMonth } from "date-fns";
import { useBudgetAccountingStore } from "@/app/store/budget";
import { BudgetTabs } from "@/shared/constants/budget";

interface BudgetItemDialogProps {
  open: boolean;
  variant: "income" | "expense";
  type: "create" | "update" | "delete";
  planned?: boolean;
  budgetItem?: BudgetItemFormValues;
  onOpenChange: (open: boolean) => void;
}

function BudgetItemDialog({
  open,
  variant,
  type,
  planned = false,
  budgetItem,
  onOpenChange,
}: BudgetItemDialogProps) {
  const tab = useBudgetAccountingStore((store) => store.tab);

  const { createMutation, createPending } = useCreateMutation();

  const { updateMutation, updatePending } = useUpdateMutation();

  const { deleteMutation, deletePending } = useDeleteMutation();

  const variantLabel = variant === "income" ? "дохода" : "расхода";

  const onCreateBudgetItem = async (data: BudgetItemFormValues) => {
    await createMutation({
      data: { ...data, variant, planned: tab === BudgetTabs.planned },
    });
    onOpenChange(false);
  };

  const onUpdateBudgetItem = async (data: BudgetItemFormValues) => {
    if (data?.id !== undefined)
      await updateMutation({ data: { ...data, id: data.id, variant } });
    onOpenChange(false);
  };

  const onDeleteBudgetItem = async () => {
    if (budgetItem?.id !== undefined)
      await deleteMutation({ id: budgetItem?.id });

    onOpenChange(false);
  };

  if (type === "delete") {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите действие</AlertDialogTitle>
            <AlertDialogDescription>
              Данное действие нельзя будет отменить. Вы действительно хотите
              удалить запись?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>
              Отменить
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePending}
              onClick={onDeleteBudgetItem}
            >
              {deletePending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Подтвердить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Добавить" : "Изменить"} статью {variantLabel}
          </DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы{" "}
            {type === "create" ? "создать" : "редактировать"} статью{" "}
            {variantLabel}
          </DialogDescription>
        </DialogHeader>

        <BudgetItemDialogForm
          budgetItem={budgetItem}
          planned={planned}
          type={type}
          pending={createPending || updatePending}
          onCancel={() => onOpenChange(false)}
          onSubmit={type === "create" ? onCreateBudgetItem : onUpdateBudgetItem}
        />
      </DialogContent>
    </Dialog>
  );
}

function BudgetItemDialogForm({
  budgetItem,
  planned,
  type,
  pending,
  onCancel,
  onSubmit,
}: Pick<BudgetItemDialogProps, "budgetItem" | "planned" | "type"> & {
  pending: boolean;
  onCancel: () => void;
  onSubmit: (data: BudgetItemFormValues) => void;
}) {
  const month = useBudgetAccountingStore((store) => store.month);
  const year = useBudgetAccountingStore((store) => store.year);

  const form = useForm<BudgetItemFormValues>({
    defaultValues: {
      id: budgetItem?.id,
      name: budgetItem?.name ?? "",
      value: budgetItem?.value ?? 0,
      date: budgetItem?.date ?? "",
      planned,
    },
    resolver: zodResolver(updateBudgetItemSchema),
    reValidateMode: "onSubmit",
    mode: "onSubmit",
  });

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-y-2">
        <InputField name="name" label="Наименование" />
        <InputField name="value" label="Сумма" type="number" />
        <DatePickerField
          name="date"
          label="Дата"
          defaultMonth={new Date(+year, +month, 1)}
          minDate={startOfMonth(new Date(+year, +month, 1))}
          maxDate={endOfMonth(new Date(+year, +month, 1))}
        />
      </div>

      <DialogFooter className="flex w-full items-center gap-x-2">
        <Button variant="destructive" disabled={pending} onClick={onCancel}>
          Отменить
        </Button>
        <Button disabled={pending} onClick={form.handleSubmit(onSubmit)}>
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : type === "create" ? (
            "Добавить"
          ) : (
            "Изменить"
          )}
        </Button>
      </DialogFooter>
    </FormProvider>
  );
}

export { BudgetItemDialog };
