import { Alert, AlertDescription } from "@/shared/ui/alert";
import { InfoIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router";
import { ROUTES } from "@/shared/constants/router";
import { Button } from "@/shared/ui/button";
import { useHomeQueries } from "@/pages/home/hooks/use-home-queries";

function EventsBoard() {
  const { eventsToday } = useHomeQueries();

  return (
    <div className="flex size-full flex-col gap-y-4 md:max-h-full md:min-h-0 md:max-w-[35%]">
      <div className="h-full max-h-full min-h-0 flex-1 rounded-md border p-4 pr-4 md:pr-1">
        <div className="flex h-full max-h-full min-h-0 flex-col">
          <h3 className="mb-4 text-base font-medium">События на сегодня</h3>
          {!eventsToday?.length && (
            <div className="mr-3 flex">
              <Alert>
                <InfoIcon />
                <AlertDescription>
                  На сегодняшний день нет событий
                </AlertDescription>
              </Alert>
            </div>
          )}
          <div className="scroll mb-2 min-h-0 flex-1 overflow-y-auto md:pr-1">
            <div className="flex flex-col gap-y-2">
              {eventsToday?.map((event) => (
                <div key={event.id} className="rounded-md border p-2">
                  <div className="flex w-full items-center gap-x-2">
                    <div className="size-1 min-w-1 rounded-full bg-green-700" />
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <span className="text-sm font-medium">{event.title}</span>
                      <span
                        className={cn("text-xs font-medium", {
                          ["text-yellow-500"]:
                            event.end_timestamp < new Date().getTime(),
                        })}
                      >
                        {format(event.start_timestamp, "HH:mm")}-
                        {format(event.end_timestamp, "HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link to={ROUTES.events_calendar} className="md:pr-3">
            <Button variant="outline" className="w-full">
              Перейти к календарю
            </Button>
          </Link>
        </div>
      </div>

      {/*<div className="flex-1 rounded-md border p-4">2</div>*/}
    </div>
  );
}

export { EventsBoard };
