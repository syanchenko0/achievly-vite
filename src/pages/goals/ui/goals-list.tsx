import { lazy, Suspense } from "react";
import { Skeleton } from "@/shared/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/use-mobile";

const GoalsListMobile = lazy(() =>
  import("@/pages/goals/ui/goals-list-mobile").then((module) => ({
    default: module.GoalsListMobile,
  })),
);
const GoalsListDesktop = lazy(() =>
  import("@/pages/goals/ui/goals-list-desktop").then((module) => ({
    default: module.GoalsListDesktop,
  })),
);

function GoalsList() {
  const { isMobile } = useIsMobile();

  return isMobile ? (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <GoalsListMobile />
    </Suspense>
  ) : (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <GoalsListDesktop />
    </Suspense>
  );
}

export { GoalsList };
