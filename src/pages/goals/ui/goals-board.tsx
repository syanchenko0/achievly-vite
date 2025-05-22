import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { type TaskDto, useGetGoals } from "@/shared/api";
import { GOALS_STATUS } from "@/shared/constants/goals";
import { CalendarIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useTasksDnd } from "@/pages/goals/hooks/use-tasks-dnd";

function GoalsBoard() {
  const { data: goals, isLoading: goalsLoading } = useGetGoals({
    params: { status: GOALS_STATUS.ongoing },
  });

  const { activeTasks, doneTasks, onDragStart, onDragEnd, activeTask } =
    useTasksDnd({ goals });

  if (goalsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
        <div className="flex size-full gap-x-6">
          <Droppable id="active">
            <div className="size-full py-4 pr-2">
              <div className="scroll flex h-full flex-col gap-y-4 overflow-x-hidden overflow-y-auto pr-2 pl-6">
                {activeTasks.map((task) => (
                  <Draggable key={task.id} id={String(task.id)}>
                    <TaskCard task={task} />
                  </Draggable>
                ))}
              </div>
            </div>
          </Droppable>

          <Droppable id="done">
            <div className="size-full py-4 pr-2">
              <div className="scroll flex h-full flex-col gap-y-4 overflow-x-hidden overflow-y-auto pr-2 pl-6">
                {doneTasks.map((task) => (
                  <Draggable key={task.id} id={String(task.id)}>
                    <TaskCard task={task} />
                  </Draggable>
                ))}
              </div>
            </div>
          </Droppable>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Droppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="size-full rounded-md border">
      {children}
    </div>
  );
}

function Draggable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
}

function TaskCard({ task }: { task: TaskDto }) {
  return (
    <div className="bg-sidebar relative w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 shadow-sm">
      <div className="flex justify-between">
        <div className="absolute top-0 left-0 h-full w-1 bg-sky-600" />
        <div className="flex flex-col gap-y-2">
          <span className="text-left text-base font-medium">{task.title}</span>
          <div className="flex items-center gap-x-2">
            <CalendarIcon className="size-4" />
            <span className="text-xs">
              {task.deadline_date
                ? format(new Date(task.deadline_date), "PPPP", { locale: ru })
                : "Дата окончания задачи не указана"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <GripVertical className="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}

export { GoalsBoard };
