import {
  type FieldValues,
  type Path,
  type UseControllerProps,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { cn } from "@/app/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/shared/ui/calendar";
import * as React from "react";
import { DayPicker } from "react-day-picker";

type FormFieldProps<T extends FieldValues, K extends Path<T>> = {
  name: UseControllerProps<T, K>["name"];
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: "text" | "number";
};

function InputField<T extends FieldValues, K extends Path<T>>({
  name,
  placeholder,
  label,
  disabled,
  type = "text",
}: FormFieldProps<T, K>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              value={field.value || ""}
              autoFocus={false}
              onChange={
                type === "number"
                  ? (event) => {
                      field.onChange(Number(event.target.value));
                    }
                  : field.onChange
              }
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

function DatePickerField<T extends FieldValues, K extends Path<T>>({
  name,
  label,
  disabled,
  maxDate,
  minDate,
  defaultMonth,
}: FormFieldProps<T, K> &
  React.ComponentProps<typeof DayPicker> & {
    maxDate?: Date;
    minDate?: Date;
  }) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
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
                defaultMonth={defaultMonth}
                onSelect={(date) =>
                  date ? field.onChange(format(date, "yyyy-MM-dd")) : undefined
                }
                disabled={(date) =>
                  (minDate ? date < minDate : false) ||
                  (maxDate ? date > maxDate : false)
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

export { InputField, DatePickerField };
