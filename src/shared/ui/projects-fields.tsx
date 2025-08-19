import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import {
  FormControl,
  FormDescription,
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
import { useParams } from "react-router";
import { useGetProject } from "@/shared/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { CalendarIcon, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { cn } from "@/app/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar } from "@/shared/ui/calendar";
import { Switch } from "@/shared/ui/switch";

type FormFieldProps<T extends FieldValues, K extends Path<T>> = {
  control: UseControllerProps<T, K>["control"];
  label?: string;
  description?: string;
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
          <Select
            onValueChange={field.onChange}
            defaultValue={String(field.value)}
          >
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

function ExecutorField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  className,
}: FormFieldProps<T, K>) {
  const { project_id } = useParams<{ project_id: string }>();

  const { data: project } = useGetProject({ project_id: project_id as string });

  if (!project) {
    return null;
  }

  return (
    <FormField
      control={control}
      name={"executor_member_id" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={String(field.value)}
          >
            <FormControl>
              <SelectTrigger disabled={disabled} className={className}>
                <SelectValue placeholder="Выберите исполнителя" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {project?.team.members.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  <div className="flex items-center gap-x-2">
                    <Avatar className="size-5">
                      <AvatarImage src={member.user.picture_url} />
                      <AvatarFallback>
                        <User className="size-5" />
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-sm font-medium">
                      {member.user.username}
                    </span>
                  </div>
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

function AuthorField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  className,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"author" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value.id}
          >
            <FormControl>
              <SelectTrigger disabled={disabled} className={className}>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={field.value.id}>
                <div className="flex items-center gap-x-2">
                  <Avatar className="size-5">
                    <AvatarImage src={field.value.user.picture_url} />
                    <AvatarFallback>
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm font-medium">
                    {field.value.user.username}
                  </span>
                </div>
              </SelectItem>
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

function RemovableField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  description,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"is_removable" as UseControllerProps<T, K>["name"]}
      render={({ field: formField }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function TaskCreationAllowedField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  description,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"is_task_creation_allowed" as UseControllerProps<T, K>["name"]}
      render={({ field: formField }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function FinalStageField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  description,
  disabled,
}: FormFieldProps<T, K>) {
  return (
    <FormField
      control={control}
      name={"is_final_stage" as UseControllerProps<T, K>["name"]}
      render={({ field: formField }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function DeadlineDateField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
}: FormFieldProps<T, K>) {
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
                // disabled={(date) => date <= new Date()}
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

function ParentTaskField<T extends FieldValues, K extends Path<T>>({
  control,
  label,
  disabled,
  className,
}: FormFieldProps<T, K>) {
  const { project_id } = useParams<{ project_id: string }>();

  const { data: project } = useGetProject({ project_id: project_id as string });

  if (!project) {
    return null;
  }

  return (
    <FormField
      control={control}
      name={"parent_task" as UseControllerProps<T, K>["name"]}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger disabled={disabled} className={className}>
                <SelectValue placeholder="Выберите родительскую задачу" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {!project?.project_parent_tasks?.length && (
                <div className="px-2 py-1">
                  <span className="text-muted-foreground text-sm font-medium">
                    Отсутствуют родительские задачи
                  </span>
                </div>
              )}
              {project?.project_parent_tasks?.map((parent_task) => (
                <SelectItem key={parent_task.id} value={String(parent_task.id)}>
                  <div className="flex items-center gap-x-2">
                    <span className="text-sm font-medium">
                      {parent_task.name}
                    </span>
                  </div>
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

export {
  NameField,
  PriorityField,
  ExecutorField,
  DescriptionField,
  DeadlineDateField,
  RemovableField,
  FinalStageField,
  AuthorField,
  TaskCreationAllowedField,
  ParentTaskField,
};
