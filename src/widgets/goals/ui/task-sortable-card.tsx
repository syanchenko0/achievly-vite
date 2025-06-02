import type { TaskDto } from "@/shared/api";
import { useSortable } from "@dnd-kit/react/sortable";
import { CalendarIcon, GripVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/shared/ui/button";

function TaskSortableCard({
  id,
  index,
  task,
  group,
  type,
  accept,
  onClick,
  onDelete,
}: {
  id: string | number;
  index: number;
  task: TaskDto;
  group?: string;
  type?: string;
  accept?: string[];
  onClick: () => void;
  onDelete?: () => void;
}) {
  const { ref } = useSortable({ id, index, group, type, accept });

  return (
    <div
      ref={ref}
      className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2"
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
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 />
            </Button>
          )}
          <GripVertical className="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}

export { TaskSortableCard };
