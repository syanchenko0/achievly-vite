import {
  type BudgetAccountingSchema,
  useGetBudgetAccounting,
} from "@/shared/api";
import { useBudgetAccountingStore } from "@/app/store/budget";
import { Skeleton } from "@/shared/ui/skeleton";
import { BudgetItemDialog } from "@/features/budget";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { cn } from "@/app/lib/utils";
import { toCurrency } from "@/pages/budget/lib/utils";
import { BudgetAccountingItems } from "@/pages/budget/ui/budget-accounting-items";
import { BudgetAccountingActionButton } from "@/pages/budget/ui/budget-accounting-action-button";

function ActualTabContent() {
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

  const { data: budgetAccounting, isLoading } = useGetBudgetAccounting({
    params: {
      month,
      year,
    },
  });

  if (isLoading) {
    return (
      <div className="flex size-full gap-x-4">
        <Skeleton className="size-full" />
        <Skeleton className="size-full" />
      </div>
    );
  }

  if (!budgetAccounting) {
    return null;
  }

  return (
    <div className="flex size-full max-h-full min-h-0 flex-col gap-y-4">
      <BudgetStatsBlock total={budgetAccounting?.meta?.total} />

      <div className="flex size-full max-h-full min-h-0 gap-x-4">
        <div className="flex size-full flex-col rounded-md border">
          <BudgetPlannedBlock
            data={
              budgetAccounting?.data?.income?.filter((item) => item.planned) ??
              []
            }
            total={budgetAccounting?.meta?.total?.income ?? 0}
            planned_total={budgetAccounting?.meta?.total?.planned_income ?? 0}
            variant="income"
          />

          <div className="size-full max-h-full min-h-0 flex-1 p-4 pr-1">
            <div className="flex size-full flex-col gap-y-4">
              <BudgetAccountingItems
                data={(budgetAccounting?.data?.income ?? []).filter(
                  (item) => !item.planned,
                )}
                variant="income"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
              <BudgetAccountingActionButton
                variant="income"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
            </div>
          </div>
        </div>

        <div className="flex size-full flex-col rounded-md border">
          <BudgetPlannedBlock
            data={
              budgetAccounting?.data?.expense?.filter((item) => item.planned) ??
              []
            }
            total={budgetAccounting?.meta?.total?.expense ?? 0}
            planned_total={budgetAccounting?.meta?.total?.planned_expense ?? 0}
            variant="expense"
          />

          <div className="size-full max-h-full min-h-0 flex-1 p-4 pr-1">
            <div className="flex size-full flex-col gap-y-4">
              <BudgetAccountingItems
                data={(budgetAccounting?.data?.expense ?? []).filter(
                  (item) => !item.planned,
                )}
                variant="expense"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
              <BudgetAccountingActionButton
                variant="expense"
                onChangeBudgetDialogData={setBudgetDialogData}
              />
            </div>
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
  );
}

function BudgetStatsBlock({
  total,
}: {
  total: {
    income: number;
    expense: number;
    planned_income: number;
    planned_expense: number;
  };
}) {
  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);

  return (
    <div className="mt-2 flex w-full items-center justify-between rounded-md border p-4">
      <span className="text-base font-medium">
        Бюджет на{" "}
        {new Date(+year, +month, 1).toLocaleString("ru-RU", {
          month: "long",
          year: "numeric",
        })}
      </span>

      <div className="flex flex-col">
        <div className="flex items-center gap-x-2">
          <span className="text-sm font-medium">Факт</span>

          <span className="text-sm font-medium">
            <span className="text-green-500">
              {toCurrency(total.income ?? 0)}
            </span>
            <span className="text-muted-foreground">{" / "}</span>
            <span className="text-red-500">
              {toCurrency(total.expense ?? 0)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <span className="text-sm font-medium">План</span>

          <span className="text-xs font-medium">
            <span className="text-green-500">
              {toCurrency(total.planned_income ?? 0)}
            </span>
            <span className="text-muted-foreground">{" / "}</span>
            <span className="text-red-500">
              {toCurrency(total.planned_expense ?? 0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function BudgetPlannedBlock({
  data,
  total,
  planned_total,
  variant,
}: {
  data: BudgetAccountingSchema[];
  total: number;
  planned_total: number;
  variant: "income" | "expense";
}) {
  if (!data.length) return null;

  return (
    <Accordion type="single" collapsible className="p-4">
      <AccordionItem
        value="item-1"
        className="rounded-md border border-b px-4 pr-1 last:border-b"
      >
        <AccordionTrigger className="pr-3.5">
          <div className="flex flex-col gap-y-1">
            <span>
              Плановые {variant === "income" ? "доходы" : "расходы"} на текущий
              месяц
            </span>
            <span
              className={cn("text-muted-foreground text-xs", {
                ["text-yellow-500"]: total > planned_total,
              })}
            >
              {total > planned_total
                ? `Вы превысили план доходов на ${toCurrency(total - planned_total)}`
                : `До плана осталось ${toCurrency(planned_total - total)}`}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="scroll max-h-[300px] overflow-y-auto">
          {data.map((planned_item) => (
            <div
              key={planned_item.id}
              className="flex items-center justify-between gap-x-2 pr-2"
            >
              <div className="flex items-center gap-x-2">
                <div
                  className={cn("size-2 min-w-2 rounded-full", {
                    ["bg-green-500"]: variant === "income",
                    ["bg-red-500"]: variant === "expense",
                  })}
                />
                <div className="flex items-center gap-x-2">
                  <span className="text-sm font-medium">
                    {planned_item.name}
                  </span>
                  <span className="text-muted-foreground text-xs font-bold">
                    {new Date(planned_item.date).toLocaleDateString("ru", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <span
                className={cn("text-sm font-medium", {
                  ["text-green-500"]: variant === "income",
                  ["text-red-500"]: variant === "expense",
                })}
              >
                {toCurrency(planned_item.value)}
              </span>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { ActualTabContent };
