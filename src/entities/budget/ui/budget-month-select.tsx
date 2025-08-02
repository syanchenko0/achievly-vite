import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { MONTHS } from "@/shared/constants/date";

interface BudgetMonthSelectProps {
  minMonth?: number;
  maxMonth?: number;
  defaultValue: string;
  onValueChange: (month: string) => void;
}

function BudgetMonthSelect({
  minMonth,
  maxMonth,
  defaultValue,
  onValueChange,
}: BudgetMonthSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder="Выберите месяц" />
      </SelectTrigger>

      <SelectContent>
        {MONTHS.map((month_item) => (
          <SelectItem
            key={month_item.value}
            value={month_item.value.toString()}
            disabled={
              month_item.value > (maxMonth ?? month_item.value) ||
              month_item.value < (minMonth ?? month_item.value)
            }
          >
            {month_item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { BudgetMonthSelect };
