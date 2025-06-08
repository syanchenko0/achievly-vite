import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import ru from "@fullcalendar/core/locales/ru";
import type {
  DatesSetArg,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/core";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { endOfWeek, format, startOfWeek } from "date-fns";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/ui/context-menu";
import { useEventsCalendarQueries } from "@/pages/events/hooks/use-events-calendar-queries";

function EventsCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [period, setPeriod] = useState([
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  ]);

  const { events, updateEvent, deleteEvent } = useEventsCalendarQueries({
    period,
  });

  const handleEventUpdate = (info: EventDropArg | EventResizeDoneArg) => {
    updateEvent({
      id: info.event.id,
      data: {
        title: info.event.title,
        start_timestamp: info.event.start?.getTime() || 0,
        end_timestamp: info.event.end?.getTime() || 0,
      },
    });
  };

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const start = dateInfo.startStr.split("T")[0];
    const end = dateInfo.endStr.split("T")[0];
    setPeriod([start, end]);
  };

  const handleDelete = (info: EventContentArg) => {
    deleteEvent({ event_id: info.event.id });
  };

  useEffect(() => {
    searchParams.set("start-period", period[0]);
    searchParams.set("end-period", period[1]);
    setSearchParams(searchParams);
  }, [period]);

  return (
    <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
      <FullCalendar
        editable
        droppable
        height="100%"
        allDaySlot={false}
        locale={ru}
        initialDate={new Date().toISOString()}
        plugins={[timeGridPlugin, interactionPlugin]}
        slotMinTime={"00:00:00"}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        events={events?.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          start: new Date(event.start_timestamp),
          end: new Date(event.end_timestamp),
        }))}
        eventDrop={handleEventUpdate}
        eventResize={handleEventUpdate}
        datesSet={handleDatesSet}
        eventContent={(info) => (
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="flex size-full flex-col p-2 text-start text-xs">
                <span>
                  {info.event.start?.toLocaleTimeString("ru-RU", {
                    hour: "numeric",
                    minute: "numeric",
                  })}{" "}
                  -{" "}
                  {info.event.end?.toLocaleTimeString("ru-RU", {
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </span>
                {info.event.title}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleDelete(info)}>
                Удалить событие
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      />
    </div>
  );
}

export { EventsCalendar };
