import { cn } from "@/app/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { BudgetAccountingSchema } from "@/shared/api";
import { toCurrency } from "../lib/utils";

interface BudgetAccountingItemProps {
  data: BudgetAccountingSchema;
  variant: "income" | "expense";
  isActionBtnVisible?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function BudgetAccountingItem({
  data,
  variant,
  isActionBtnVisible = true,
  onEdit,
  onDelete,
}: BudgetAccountingItemProps) {
  return (
    <div className="flex items-center justify-between gap-x-2 rounded-md border px-4 py-2">
      <div className="flex items-center gap-x-2">
        <div
          className={cn("size-2 min-w-2 rounded-full", {
            ["bg-green-500"]: variant === "income",
            ["bg-red-500"]: variant === "expense",
          })}
        />
        <div className="flex items-center gap-x-2">
          <span className="text-sm font-medium">{data.name}</span>
          <span className="text-muted-foreground text-xs font-bold">
            {new Date(data.date).toLocaleDateString("ru", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <span
          className={cn("text-sm font-medium", {
            ["text-green-500"]: variant === "income",
            ["text-red-500"]: variant === "expense",
          })}
        >
          {toCurrency(data.value)}
        </span>

        {isActionBtnVisible && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export { BudgetAccountingItem };
