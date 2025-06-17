import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { GOAL_CATEGORIES_LABELS } from "@/shared/constants/goals";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { cn } from "@/app/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/shared/ui/calendar";
import { ResizeTextarea } from "@/shared/ui/resize-textarea";

type FormFieldProps<T extends FieldValues, K extends Path<T>> = {
  control: UseControllerProps<T, K>["control"];
  label?: string;
  className?: string;
  disabled?: boolean;
};

function TitleField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"title" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Введите заголовок"
              value={field.value || ""}
              onChange={field.onChange}
              className="text-sm sm:text-base"
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function CategoryField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  className,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"category" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger disabled={disabled} className={className}>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(GOAL_CATEGORIES_LABELS).map((entry) => (
                <SelectItem key={entry[0]} value={entry[0]}>
                  {entry[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DeadlineDateField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  maxDate,
}: FormFieldProps<T, K> & { maxDate?: Date }) {
  return (
    <FormField
      control={control}
      name={"deadline_date" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP", { locale: ru })
                  ) : (
                    <span>Выбрать дату</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="pointer-events-auto w-auto p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) =>
                  date ? field.onChange(format(date, "yyyy-MM-dd")) : undefined
                }
                disabled={(date) =>
                  date <= new Date() || (maxDate ? date > maxDate : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NoteField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"note" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ResizeTextarea
              placeholder="Введите примечание"
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { TitleField, CategoryField, DeadlineDateField, NoteField };
