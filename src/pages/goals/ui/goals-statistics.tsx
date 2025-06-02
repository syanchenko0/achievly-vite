import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useGetGoals } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const chartConfig = {
  tasks: {
    label: "Выполенные задачи",
    color: "#2563eb",
  },
} satisfies ChartConfig;

function GoalsStatistics() {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear(),
  );

  const { data: goals, isLoading: goalsLoading } = useGetGoals({
    params: undefined,
  });

  const chartData = useMemo(() => {
    const allTasks = goals?.flatMap((goal) => goal.tasks) || [];

    const months = [
      { month: "Январь", tasks: 0 },
      { month: "Февраль", tasks: 0 },
      { month: "Март", tasks: 0 },
      { month: "Апрель", tasks: 0 },
      { month: "Май", tasks: 0 },
      { month: "Июнь", tasks: 0 },
      { month: "Июль", tasks: 0 },
      { month: "Август", tasks: 0 },
      { month: "Сентябрь", tasks: 0 },
      { month: "Октябрь", tasks: 0 },
      { month: "Ноябрь", tasks: 0 },
      { month: "Декабрь", tasks: 0 },
    ];

    allTasks?.forEach((task) => {
      if (task?.done_date) {
        const year = new Date(task.done_date).getFullYear();
        const month = new Date(task.done_date).getMonth();
        if (currentYear === year) months[month].tasks++;
      }
    });

    return months;
  }, [currentYear, goals]);

  if (goalsLoading) {
    return <Skeleton className="size-full" />;
  }

  return (
    <div className="bg-sidebar flex size-full flex-col gap-y-4 rounded-md border p-4">
      <Card className="size-full justify-between">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-sm lg:text-base">
              Общая статистика по выполненным задачам
            </span>
            <Select
              value={String(currentYear)}
              onValueChange={(value) => setCurrentYear(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={String(new Date().getFullYear() - 2)}>
                    {new Date().getFullYear() - 2}
                  </SelectItem>
                  <SelectItem value={String(new Date().getFullYear() - 1)}>
                    {new Date().getFullYear() - 1}
                  </SelectItem>
                  <SelectItem value={String(new Date().getFullYear())}>
                    {new Date().getFullYear()}
                  </SelectItem>
                  <SelectItem value={String(new Date().getFullYear() + 1)}>
                    {new Date().getFullYear() + 1}
                  </SelectItem>
                  <SelectItem value={String(new Date().getFullYear() + 2)}>
                    {new Date().getFullYear() + 2}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[80%]">
          <ChartContainer config={chartConfig} className="size-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 25,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                content={<ChartTooltipContent className="w-[220px]" />}
              />
              <Bar dataKey="tasks" fill="#2563eb" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export { GoalsStatistics };
