import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { type TaskDto, useGetTasks } from "@/shared/api";
import {
  endOfWeek,
  format,
  getTime,
  setHours,
  setMinutes,
  startOfWeek,
} from "date-fns";
import { Button } from "@/shared/ui/button";
import { useSearchParams } from "react-router";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ru } from "date-fns/locale";
import { Checkbox } from "@/shared/ui/checkbox";
import { useState } from "react";
import { useEventCreateQuery } from "@/features/events/hooks/use-event-create-queries";

function EventCreateFromTasksDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-2">
        <Content open={open} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [searchParams] = useSearchParams();

  const [selectedTasks, setSelectedTasks] = useState<TaskDto[]>([]);

  const period = [
    searchParams.get("start-period") ||
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    searchParams.get("end-period") ||
      format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  ];

  const { createEvents, createEventsPending } = useEventCreateQuery({ period });

  const { data: tasks, isLoading: tasksLoading } = useGetTasks(
    {
      params: { status: "active" },
    },
    {
      query: { enabled: open },
    },
  );

  const defaultTimestamps = {
    start_timestamp: getTime(setMinutes(setHours(period[0], 8), 0)),
    end_timestamp: getTime(setMinutes(setHours(period[0], 9), 30)),
  };

  const handleCreateEvents = async () => {
    await createEvents({
      data: {
        events: selectedTasks.map((task) => ({
          title: task.title,
          ...defaultTimestamps,
        })),
      },
    });

    onOpenChange(false);
  };

  const handleSelectTask = (task: TaskDto) => {
    setSelectedTasks((prev) => {
      if (prev.includes(task)) {
        return prev.filter((t) => t.id !== task.id);
      } else {
        return [...prev, task];
      }
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DialogHeader>
        <DialogTitle>Добавить события</DialogTitle>
        <DialogDescription>
          Выберите задачи, которые хотите добавить в события
        </DialogDescription>
      </DialogHeader>

      <div className="scroll max-h-[400px] overflow-y-auto">
        <div className="flex flex-col gap-y-2 pr-2">
          {tasksLoading && <Loader2 className="animate-spin self-center" />}
          {!tasksLoading &&
            tasks?.map((task) => (
              <div
                key={task.id}
                className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 outline-none"
                onClick={() => handleSelectTask(task)}
              >
                <div className="flex justify-between">
                  <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
                  <div className="flex flex-col gap-y-2">
                    <span className="text-left text-base font-medium">
                      {task.title}
                    </span>
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
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedTasks.map((s) => s.id).includes(task.id)}
                      onCheckedChange={() => handleSelectTask(task)}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <DialogFooter className="pr-4">
        <Button
          disabled={
            createEventsPending || tasksLoading || !selectedTasks.length
          }
          onClick={handleCreateEvents}
        >
          {createEventsPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Добавить события"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

export { EventCreateFromTasksDialog };
