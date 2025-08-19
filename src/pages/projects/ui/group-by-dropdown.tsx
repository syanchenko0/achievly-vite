import { useProjectStore } from "@/app/store/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { StretchHorizontal } from "lucide-react";
import {
  PROJECT_TASK_GROUP_BY,
  PROJECT_TASK_GROUP_BY_LABELS,
} from "@/shared/constants/projects";

function GroupByDropdown() {
  const groupBy = useProjectStore((store) => store.groupBy);
  const setGroupBy = useProjectStore((store) => store.setGroupBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <StretchHorizontal />
          <span>
            {groupBy &&
              PROJECT_TASK_GROUP_BY_LABELS[
                groupBy as keyof typeof PROJECT_TASK_GROUP_BY
              ]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.values(PROJECT_TASK_GROUP_BY).map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => {
              setGroupBy(value);
            }}
          >
            {PROJECT_TASK_GROUP_BY_LABELS[value]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { GroupByDropdown };
