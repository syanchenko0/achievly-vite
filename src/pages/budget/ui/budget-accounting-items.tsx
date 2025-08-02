import type { BudgetAccountingSchema } from "@/shared/api";
import { BudgetAccountingItem } from "@/pages/budget/ui/budget-accounting-item";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { useBudgetAccountingStore } from "@/app/store/budget";
import { BudgetTabs } from "@/shared/constants/budget";

interface BudgetAccountingItemProps {
  data: BudgetAccountingSchema[];
  variant: "income" | "expense";
  onChangeBudgetDialogData: (data: {
    open: boolean;
    type: "create" | "update" | "delete";
    variant: "income" | "expense";
    budgetItem?: BudgetAccountingSchema;
  }) => void;
}

function BudgetAccountingItems({
  data,
  variant,
  onChangeBudgetDialogData,
}: BudgetAccountingItemProps) {
  const tab = useBudgetAccountingStore((state) => state.tab);

  if (!data?.length) {
    return (
      <div className="size-full min-h-0 flex-1">
        <div className="mt-4 mr-3 block">
          <Alert>
            <AlertTitle>Отсутствуют записи</AlertTitle>
            <AlertDescription>
              {tab === BudgetTabs.archive
                ? "Здесь отображаются записи, дата которых меньше текущего месяца"
                : `Добавьте статью ${variant === "income" ? "дохода" : "расхода"}, чтобы она появилась здесь`}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll size-full min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-1 flex-col gap-y-2 pr-1">
        {data.map((budget_item) => (
          <BudgetAccountingItem
            key={budget_item.id}
            variant={variant}
            data={budget_item}
            onEdit={() => {
              onChangeBudgetDialogData({
                open: true,
                type: "update",
                variant,
                budgetItem: budget_item,
              });
            }}
            onDelete={() => {
              onChangeBudgetDialogData({
                open: true,
                type: "delete",
                variant,
                budgetItem: budget_item,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { BudgetAccountingItems };
