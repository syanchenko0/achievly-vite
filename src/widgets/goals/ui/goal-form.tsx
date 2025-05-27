import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import type { CreateGoalBodySchema, GoalBodyTask, TaskDto } from "@/shared/api";
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
import { CalendarIcon, GripVertical, Plus } from "lucide-react";
import { Calendar } from "@/shared/ui/calendar";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { TaskCreateSheet } from "@/widgets/goals/ui/task-create-sheet";
import { TaskUpdateSheet } from "@/widgets/goals/ui/task-update-sheet";
import { useSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider } from "@dnd-kit/react";

function GoalForm() {
  const [openCreateSheet, setOpenCreateSheet] = useState<boolean>(false);

  const [openUpdateSheet, setOpenUpdateSheet] = useState<boolean>(false);

  const [taskForUpdate, setTaskForUpdate] = useState<GoalBodyTask>();

  const [indexTaskForUpdate, setIndexTaskForUpdate] = useState<number>();

  const form = useFormContext<CreateGoalBodySchema>();

  const { fields, append, update, move } = useFieldArray({
    control: form.control,
    name: "tasks",
    keyName: "field_id",
  });

  return (
    <div className="flex flex-col gap-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Наименование цели</FormLabel>
            <FormControl>
              <Input placeholder="Введите наименование" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Категория</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-1/2">
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
      <FormField
        control={form.control}
        name="deadline_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Дата окончания цели</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-1/2 pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
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
                    date
                      ? field.onChange(format(date, "yyyy-MM-dd"))
                      : undefined
                  }
                  disabled={(date) => date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <DragDropProvider
        onDragOver={({ operation: { source, target } }) => {
          if (source?.id !== target?.id) {
            const oldIndex = fields.findIndex((f) => f.field_id === source?.id);
            const newIndex = fields.findIndex((f) => f.field_id === target?.id);

            move(oldIndex, newIndex);
          }
        }}
      >
        <div className="flex flex-col gap-y-2">
          <span className="text-sm font-medium">Список задач</span>
          {fields.map((field, index) => (
            <SortableTaskCard
              key={field.field_id}
              id={field.field_id}
              index={index}
              task={field as TaskDto}
              onClick={() => {
                setTaskForUpdate(field);
                setIndexTaskForUpdate(index);
                setOpenUpdateSheet(true);
              }}
            />
          ))}

          <Button type="button" onClick={() => setOpenCreateSheet(true)}>
            <Plus />
            Добавить задачу
          </Button>
        </div>
      </DragDropProvider>

      <TaskCreateSheet
        open={openCreateSheet}
        setOpen={setOpenCreateSheet}
        onCreate={(data: GoalBodyTask) => append(data)}
      />

      {taskForUpdate && (
        <TaskUpdateSheet
          task={taskForUpdate}
          onUpdate={(data) => update(indexTaskForUpdate as number, data)}
          open={openUpdateSheet}
          setOpen={setOpenUpdateSheet}
        />
      )}
    </div>
  );
}

function SortableTaskCard({
  id,
  index,
  task,
  onClick,
}: {
  id: string;
  index: number;
  task: TaskDto;
  onClick: () => void;
}) {
  const { ref } = useSortable({ id, index });

  return (
    <button
      ref={ref}
      className="bg-background relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2"
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
        <div className="flex flex-col gap-y-2">
          <span className="text-left text-base font-medium">{task.title}</span>
          <div className="flex items-center gap-x-2">
            <CalendarIcon className="size-4" />
            <span className="text-xs">
              {task.deadline_date
                ? format(new Date(task.deadline_date), "PPPP", {
                    locale: ru,
                  })
                : "Дата окончания задачи не указана"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <GripVertical className="text-neutral-400" />
        </div>
      </div>
    </button>
  );
}

export { GoalForm };
