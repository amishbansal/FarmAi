"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";

const chartData = [
  ...Array.from({ length: 90 }, (_, i) => {
    const date = new Date(2024, 3, 1); // Start from April 1, 2024
    date.setDate(date.getDate() + i);

    return {
      date: date.toISOString().split("T")[0],
      temperature: Math.floor(Math.random() * 11) + 5, // Random temperature between 20-30
      soilMoisture: Math.floor(Math.random() * 11) + 10, // Random soil moisture between 10-20
    };
  }),
];

export function ChartTwo() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const { t, i18n } = useTranslation();

  const chartConfig = {
    temperature: {
      label: t("iotdata.temperatureLabel"),
      color: "hsl(var(--chart-1))",
    },
    soilMoisture: {
      label: t("iotdata.soilMoistureLabel"),
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="bg-secondary">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{t("iotdata.sensorDataHistoryTitle")}</CardTitle>
          <CardDescription>{t("iotdata.sensorDataHistoryDescription")}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              {t("iotdata.last3Months")}
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              {t("iotdata.last30Days")}
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              {t("iotdata.last7Days")}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-temperature)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-temperature)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSoilMoisture" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-soilMoisture)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-soilMoisture)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDate(value, i18n.language)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value, i18n.language)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="soilMoisture"
              type="natural"
              fill="url(#fillSoilMoisture)"
              stroke="var(--color-soilMoisture)"
              stackId="a"
            />
            <Area
              dataKey="temperature"
              type="natural"
              fill="url(#fillTemperature)"
              stroke="var(--color-temperature)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
