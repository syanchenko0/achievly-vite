import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/use-mobile";

const GoalsTasksMobile = lazy(() =>
  import("@/pages/goals/ui/goals-tasks-mobile").then((module) => ({
    default: module.GoalsTasksMobile,
  })),
);
const GoalsTasksDesktop = lazy(() =>
  import("@/pages/goals/ui/goals-tasks-desktop").then((module) => ({
    default: module.GoalsTasksDesktop,
  })),
);

function GoalsTasks() {
  const { isMobile } = useIsMobile();

  return isMobile ? (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <GoalsTasksMobile />
    </Suspense>
  ) : (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <GoalsTasksDesktop />
    </Suspense>
  );
}

export { GoalsTasks };
