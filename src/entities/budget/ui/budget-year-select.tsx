import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface BudgetYearSelectProps {
  minYear?: number;
  maxYear?: number;
  defaultValue: string;
  years: number[];
  onValueChange: (month: string) => void;
}

function BudgetYearSelect({
  minYear,
  maxYear,
  defaultValue,
  years,
  onValueChange,
}: BudgetYearSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder="Выберите год" />
      </SelectTrigger>

      <SelectContent>
        {years.map((year) => (
          <SelectItem
            key={year}
            value={year.toString()}
            disabled={year > (maxYear ?? year) || year < (minYear ?? year)}
          >
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { BudgetYearSelect };
