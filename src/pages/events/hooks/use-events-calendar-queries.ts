import {
  type EventDto,
  getEventsQueryKey,
  useCreateEvents,
  useDeleteEvent,
  useGetEvents,
  useUpdateEvent,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { useIsMobile } from "@/shared/hooks/use-mobile";

const useEventsCalendarQueries = ({ period }: { period: string[] }) => {
  const { isMobile } = useIsMobile();

  const queryClient = useQueryClient();

  const { data: events } = useGetEvents({
    params: {
      start_period: period[0],
      end_period: period[1],
    },
  });

  const { mutateAsync: createEvents, isPending: createEventsPending } =
    useCreateEvents({
      mutation: {
        onSettled: async (newEvents) => {
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

          queryClient.setQueryData(
            getEventsQueryKey({
              start_period: period[0],
              end_period: period[1],
            }),
            [...(previousEvents || []), ...(newEvents || [])],
          );

          return { previousEvents };
        },
      },
    });

  const { mutate: updateEvent } = useUpdateEvent({
    mutation: {
      onMutate: async (updated) => {
        if (!isMobile) {
          await queryClient.invalidateQueries({
            queryKey: getEventsQueryKey({
              start_period: format(new Date(), "yyyy-MM-dd"),
              end_period: format(addDays(new Date(), 1), "yyyy-MM-dd"),
            }),
          });
        }

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
        await queryClient.invalidateQueries({
          queryKey: getEventsQueryKey({
            start_period: format(new Date(), "yyyy-MM-dd"),
            end_period: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          }),
        });

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

  return {
    events,
    createEvents,
    createEventsPending,
    updateEvent,
    deleteEvent,
  };
};

export { useEventsCalendarQueries };
