import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/app/lib/utils";
import {
  PROJECT_TASK_PRIORITY,
  PROJECT_TASK_PRIORITY_LABELS,
} from "@/shared/constants/projects";
import { ChevronsUp, ChevronUp, TriangleAlert } from "lucide-react";

function TaskPriority({ priority }: { priority: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={cn(
            "flex size-7 min-w-7 cursor-pointer items-center justify-center rounded-md p-1 transition-colors",
            {
              "hover:bg-green-500/20": priority === PROJECT_TASK_PRIORITY.LOW,
              "hover:bg-yellow-400/20":
                priority === PROJECT_TASK_PRIORITY.MEDIUM,
              "hover:bg-red-500/20":
                priority === PROJECT_TASK_PRIORITY.HIGH ||
                priority === PROJECT_TASK_PRIORITY.CRITICAL,
            },
          )}
        >
          {priority === PROJECT_TASK_PRIORITY.LOW && (
            <ChevronUp className="size-5 text-green-500" />
          )}
          {priority === PROJECT_TASK_PRIORITY.MEDIUM && (
            <ChevronsUp className="size-5 text-yellow-400" />
          )}
          {priority === PROJECT_TASK_PRIORITY.HIGH && (
            <ChevronsUp className="size-5 text-red-500" />
          )}
          {priority === PROJECT_TASK_PRIORITY.CRITICAL && (
            <TriangleAlert className="size-4 text-red-500" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {
          PROJECT_TASK_PRIORITY_LABELS[
            priority as keyof typeof PROJECT_TASK_PRIORITY
          ]
        }
      </TooltipContent>
    </Tooltip>
  );
}

export { TaskPriority };
