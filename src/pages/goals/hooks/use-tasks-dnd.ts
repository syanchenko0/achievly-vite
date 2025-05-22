import { useEffect, useState } from "react";
import type { GoalDto, TaskDto } from "@/shared/api";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

const useTasksDnd = ({ goals }: { goals?: GoalDto[] }) => {
  const [activeTasks, setActiveTasks] = useState<TaskDto[]>([]);
  const [doneTasks, setDoneTasks] = useState<TaskDto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeTask = [...activeTasks, ...doneTasks].find(
    (task) => String(task.id) === activeId,
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIncluded = activeTasks.some((t) => String(t.id) === active.id);
    const doneIncluded = doneTasks.some((t) => String(t.id) === active.id);

    const task = (activeIncluded ? activeTasks : doneTasks).find(
      (t) => String(t.id) === active.id,
    );

    if (!task) return;

    if (over.id === "done") {
      if (activeIncluded)
        setActiveTasks((prev) => prev.filter((t) => t.id !== task.id));
      if (!doneIncluded) setDoneTasks((prev) => [...prev, task]);
    }

    if (over.id === "active") {
      if (doneIncluded)
        setDoneTasks((prev) => prev.filter((t) => t.id !== task.id));
      if (!activeIncluded) setActiveTasks((prev) => [...prev, task]);
    }
  }

  useEffect(() => {
    if (goals) {
      setActiveTasks(
        goals.flatMap((g) => (g.tasks || []).filter((t) => !t.done_date)),
      );
      setDoneTasks(
        goals.flatMap((g) => (g.tasks || []).filter((t) => t.done_date)),
      );
    }
  }, [goals]);

  return { activeTasks, doneTasks, onDragStart, onDragEnd, activeTask };
};

export { useTasksDnd };
