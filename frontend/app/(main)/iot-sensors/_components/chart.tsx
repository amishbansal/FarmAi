"use client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 40, mobile: 37 },
  { month: "February", desktop: 30, mobile: 42 },
  { month: "March", desktop: 75, mobile: 30 },
  { month: "April", desktop: 80, mobile: 35 },
  { month: "May", desktop: 55, mobile: 42 },
  { month: "June", desktop: 90, mobile: 32 },
  { month: "July", desktop: 55, mobile: 32 },
  { month: "August", desktop: 80, mobile: 42 },
  { month: "September", desktop: 90, mobile: 30 },
  { month: "October", desktop: 75, mobile: 42 },
  { month: "November", desktop: 30, mobile: 35 },
  { month: "December", desktop: 40, mobile: 30 },

];

const chartConfig = {
  desktop: {
    label: "Soil Moisture",
    color: "#854D4E",
  },
  mobile: {
    label: "Temperature",
    color: "#A16207",
  },
} satisfies ChartConfig;

export function IoTChart() {
  return (
    <Card className=" bg-secondary">
      <CardHeader>
        <CardTitle>Sensor History</CardTitle>
        <CardDescription>
          Showing the history of sensors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="flex w-full gap-2">
            <div className="flex justify-center w-full items-center gap-3 font-medium leading-none">
              <div className=" h-5 w-5 rounded-sm bg-[#854D4E]" /> Soil Moisture
              <div className=" h-5 w-5 rounded-sm bg-[#af811c]" /> Temperature
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
