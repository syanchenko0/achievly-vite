import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { GoalsCreateSheet } from "@/widgets/goals/ui/goals-create-sheet";
import { useState } from "react";

function GoalsCreate() {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Создать цель
      </Button>

      {isMobile ? <div /> : <GoalsCreateSheet open={open} setOpen={setOpen} />}
    </div>
  );
}

export { GoalsCreate };
