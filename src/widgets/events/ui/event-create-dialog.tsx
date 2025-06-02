import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { TitleField } from "@/shared/ui/goals-fields";
import { FormProvider, useForm } from "react-hook-form";
import {
  type CreateEventBody,
  createEventBodySchema,
  type EventDto,
  getEventsQueryKey,
  useCreateEvents,
} from "@/shared/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  endOfWeek,
  format,
  getTime,
  setHours,
  setMinutes,
  startOfWeek,
} from "date-fns";
import { Button } from "@/shared/ui/button";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function EventCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Content onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

const Content = ({
  onOpenChange,
}: {
  onOpenChange: (value: boolean) => void;
}) => {
  const form = useForm<CreateEventBody>({
    defaultValues: {
      title: "",
      start_timestamp: 0,
      end_timestamp: 0,
    },
    resolver: zodResolver(createEventBodySchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const [searchParams] = useSearchParams();

  const period = [
    searchParams.get("start-period") ||
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    searchParams.get("end-period") ||
      format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  ];

  const queryClient = useQueryClient();

  const { mutate: createEvents, isPending: createEventsPending } =
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

          onOpenChange(false);
          form.reset();

          return { previousEvents };
        },
      },
    });

  const handleCreateEvents = (data: CreateEventBody) => {
    createEvents({
      data: {
        events: [
          {
            ...data,
            start_timestamp: getTime(setMinutes(setHours(period[0], 8), 0)),
            end_timestamp: getTime(setMinutes(setHours(period[0], 9), 30)),
          },
        ],
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleCreateEvents)}
        className="flex flex-col gap-y-4"
      >
        <DialogHeader>
          <DialogTitle>Создание события</DialogTitle>
          <DialogDescription>
            Заполните необходимые поля, чтобы создать событие
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-y-4">
          <TitleField control={form.control} />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={createEventsPending}>
            {createEventsPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Создать событие"
            )}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
};

export { EventCreateDialog };
