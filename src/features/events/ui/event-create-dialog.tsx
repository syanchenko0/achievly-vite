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
import { type CreateEventBody } from "@/shared/api";
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
import { Loader2 } from "lucide-react";
import { createEventBodySchema } from "@/shared/zod/createEventBodySchema";
import { useEventCreateQuery } from "@/features/events/hooks/use-event-create-queries";

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

  const { createEvents, createEventsPending } = useEventCreateQuery({ period });

  const handleCreateEvents = async (data: CreateEventBody) => {
    await createEvents({
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

    onOpenChange(false);
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
