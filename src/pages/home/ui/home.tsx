import { EventsBoard } from "@/pages/home/ui/events-board";
import { GoalsBoard } from "@/pages/home/ui/goals-board";
import { ProjectsBoard } from "@/pages/home/ui/projects-board";

function Home() {
  return (
    <div className="bg-sidebar size-full rounded-md border p-4">
      <div className="flex size-full gap-x-4">
        <EventsBoard />

        <div className="flex size-full flex-col gap-y-4">
          <GoalsBoard />

          <ProjectsBoard />
        </div>
      </div>
    </div>
  );
}

export { Home };
