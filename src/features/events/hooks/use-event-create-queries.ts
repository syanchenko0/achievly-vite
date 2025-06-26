import {
  type EventDto,
  getEventsQueryKey,
  useCreateEvents,
} from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";

const useEventCreateQuery = ({ period }: { period: string[] }) => {
  const queryClient = useQueryClient();

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

  return { createEvents, createEventsPending };
};

export { useEventCreateQuery };
