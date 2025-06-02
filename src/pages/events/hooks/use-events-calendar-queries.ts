import {
  type EventDto,
  getEventsQueryKey,
  useDeleteEvent,
  useGetEvents,
  useUpdateEvent,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";

const useEventsCalendarQueries = ({ period }: { period: string[] }) => {
  const queryClient = useQueryClient();

  const { data: events } = useGetEvents({
    params: {
      start_period: period[0],
      end_period: period[1],
    },
  });

  const { mutate: updateEvent } = useUpdateEvent({
    mutation: {
      onMutate: async (updated) => {
        await queryClient.cancelQueries({
          queryKey: getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
        });

        const previousEvents = queryClient.getQueryData<EventDto[]>(
          getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
        );

        queryClient.setQueryData<EventDto[]>(
          getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
          previousEvents?.map((event) => {
            if (event.id === Number(updated.id)) {
              return {
                ...event,
                title: updated.data.title,
                start_timestamp: updated.data.start_timestamp,
                end_timestamp: updated.data.end_timestamp,
              };
            }
            return event;
          }),
        );

        return { previousEvents };
      },
    },
  });

  const { mutate: deleteEvent } = useDeleteEvent({
    mutation: {
      onMutate: async (deleted) => {
        await queryClient.cancelQueries({
          queryKey: getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
        });

        const previousEvents = queryClient.getQueryData<EventDto[]>(
          getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
        );

        queryClient.setQueryData<EventDto[]>(
          getEventsQueryKey({
            start_period: period[0],
            end_period: period[1],
          }),
          previousEvents?.filter(
            (event) => event.id !== Number(deleted.event_id),
          ),
        );

        return { previousEvents };
      },
    },
  });

  return { events, updateEvent, deleteEvent };
};

export { useEventsCalendarQueries };
