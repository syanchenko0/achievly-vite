import type { BudgetAccountingSchema } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

interface BudgetAccountingActionButtonProps {
  variant: "income" | "expense";
  onChangeBudgetDialogData: (data: {
    open: boolean;
    type: "create" | "update" | "delete";
    variant: "income" | "expense";
    budgetItem?: BudgetAccountingSchema;
  }) => void;
}

function BudgetAccountingActionButton({
  variant,
  onChangeBudgetDialogData,
}: BudgetAccountingActionButtonProps) {
  return (
    <Button
      onClick={() =>
        onChangeBudgetDialogData({
          open: true,
          type: "create",
          variant,
        })
      }
      className="mr-3.5"
    >
      <Plus />
      <span>Добавить статью {variant === "income" ? "дохода" : "расхода"}</span>
    </Button>
  );
}

export { BudgetAccountingActionButton };