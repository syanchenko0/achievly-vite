import { useFormContext } from "react-hook-form";
import { type GoalBodyTask } from "@/shared/api";
import {
  Form,
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
import { ResizeTextarea } from "@/shared/ui/resize-textarea";

function TaskForm() {
  const form = useFormContext<GoalBodyTask>();

  return (
    <Form {...form}>
      <div className="flex flex-col gap-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Наименование задачи</FormLabel>
              <FormControl>
                <Input placeholder="Введите наименование" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Дата окончания задачи</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
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

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Примечание к задаче</FormLabel>
              <FormControl>
                <ResizeTextarea placeholder="Введите примечание" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

export { TaskForm };
