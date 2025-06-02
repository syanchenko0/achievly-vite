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
import { ResizeTextarea } from "@/shared/ui/resize-textarea";
import { PROJECT_TASK_PRIORITY_LABELS } from "@/shared/constants/projects";

type FormFieldProps<T extends FieldValues, K extends Path<T>> = {
  control: UseControllerProps<T, K>["control"];
  label?: string;
  className?: string;
  disabled?: boolean;
};

function NameField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"name" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Введите наименование"
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

function PriorityField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  className,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"priority" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger disabled={disabled} className={className}>
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(PROJECT_TASK_PRIORITY_LABELS).map((entry) => (
                <SelectItem key={entry[0]} value={entry[0]}>
                  {entry[1]}
                </SelectItem>
              ))}
              <SelectItem value={"null"}>Без приоритета</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DescriptionField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"description" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ResizeTextarea
              placeholder="Введите описание"
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

export { NameField, PriorityField, DescriptionField };
