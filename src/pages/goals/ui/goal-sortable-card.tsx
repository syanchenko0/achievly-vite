import { CalendarIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSortable } from "@dnd-kit/react/sortable";
import type { GoalDto } from "@/shared/api";
import { GOAL_CATEGORY_ICONS } from "@/shared/constants/goals";

function GoalSortableCard({
  id,
  index,
  goal,
  group,
  type,
  accept,
  onClick,
}: {
  id: string | number;
  index: number;
  goal: GoalDto;
  group?: string;
  type?: string;
  accept?: string[];
  onClick: () => void;
}) {
  const { ref } = useSortable({ id, index, group, type, accept });

  return (
    <button
      ref={ref}
      className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 shadow-sm"
      onClick={onClick}
    >
      <div className="flex w-full items-center gap-x-2">
        <div className="flex size-8 min-w-8 items-center justify-center rounded-md bg-neutral-700">
          <GoalCategoryIcon category={goal?.category} size={18} />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-y-1">
            <span className="text-left text-base font-medium">
              {goal.title}
            </span>
            <div className="flex items-center gap-x-2">
              <CalendarIcon className="size-4" />
              <span className="text-xs">
                {goal.deadline_date
                  ? format(new Date(goal.deadline_date), "PPPP", {
                      locale: ru,
                    })
                  : "Дата окончания цели не указана"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <GripVertical className="text-neutral-400" />
          </div>
        </div>
      </div>
    </button>
  );
}

function GoalCategoryIcon({
  category,
  size,
}: {
  category?: string;
  size?: number;
}) {
  const Component = GOAL_CATEGORY_ICONS[category || "default"];

  return <Component size={size || 64} />;
}

export { GoalSortableCard };
