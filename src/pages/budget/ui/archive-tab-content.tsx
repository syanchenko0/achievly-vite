import { BudgetMonthSelect } from "@/entities/budget/ui/budget-month-select";
import { BudgetYearSelect } from "@/entities/budget/ui/budget-year-select";
import { useBudgetAccountingStore } from "@/app/store/budget";
import {
  type BudgetAccountingSchema,
  useGetBudgetAccounting,
} from "@/shared/api";
import { getYearsSelectOptions } from "@/pages/budget/lib/utils";
import { BudgetAccountingItems } from "@/pages/budget/ui/budget-accounting-items";
import { BudgetItemDialog } from "@/features/budget";
import { useState } from "react";

function ArchiveTabContent() {
  const [budgetDialogData, setBudgetDialogData] = useState<{
    open: boolean;
    type: "create" | "update" | "delete";
    variant: "income" | "expense";
    budgetItem?: BudgetAccountingSchema;
  }>({
    open: false,
    type: "create",
    variant: "income",
  });

  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);

  const setMonth = useBudgetAccountingStore((state) => state.setMonth);
  const setYear = useBudgetAccountingStore((state) => state.setYear);

  const { data: budgetAccounting } = useGetBudgetAccounting({
    params: {
      month,
      year,
    },
  });

  if (!budgetAccounting) {
    return null;
  }

  return (
    <div className="flex size-full max-h-full min-h-0 flex-col gap-y-4 pt-2">
      <div className="flex w-full items-center gap-x-2">
        <BudgetMonthSelect
          maxMonth={
            +year <= new Date().getFullYear()
              ? new Date().getMonth() - 1
              : undefined
          }
          defaultValue={month.toString()}
          onValueChange={setMonth}
        />

        <BudgetYearSelect
          maxYear={new Date().getFullYear()}
          defaultValue={year.toString()}
          years={getYearsSelectOptions(budgetAccounting?.meta)}
          onValueChange={setYear}
        />
      </div>

      <div className="flex size-full max-h-full min-h-0 flex-col gap-y-4">
        <div className="flex size-full max-h-full min-h-0 gap-x-4">
          <div className="flex size-full flex-col rounded-md border">
            <div className="size-full max-h-full min-h-0 flex-1 p-4 pr-1">
              <BudgetAccountingItems
                data={(budgetAccounting?.data?.income ?? []).filter(
                  (item) => !item.planned,
                )}
                variant="income"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
            </div>
          </div>

          <div className="flex size-full flex-col rounded-md border">
            <div className="size-full max-h-full min-h-0 flex-1 p-4 pr-1">
              <BudgetAccountingItems
                data={(budgetAccounting?.data?.expense ?? []).filter(
                  (item) => !item.planned,
                )}
                variant="expense"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
            </div>
          </div>
        </div>

        <BudgetItemDialog
          type={budgetDialogData.type}
          budgetItem={budgetDialogData?.budgetItem}
          variant={budgetDialogData.variant}
          open={budgetDialogData.open}
          onOpenChange={() => {
            setBudgetDialogData((prev) => ({
              ...prev,
              open: false,
            }));
          }}
        />
      </div>
    </div>
  );
}

export { ArchiveTabContent };
