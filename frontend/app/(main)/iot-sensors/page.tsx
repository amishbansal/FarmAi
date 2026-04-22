"use client";
import React from "react";
import { IoTChart } from "./_components/chart";
import { SensorFieldsCard } from "./_components/sensor-fields-card";
import { ChartTwo } from "./_components/chart-two";
import { SystemStatusCard } from "./_components/system-status-card";
import { Button } from "@/components/ui/button";
import { Columns2Icon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const IoTSensorsPage = () => {
  const { toggleSidebar } = useSidebar();
  return <div
   className="h-full w-full relative"
  >
    <Button variant={'ghost'} size={'icon'} className="absolute top-1 left-1 z-10" onClick={toggleSidebar}>
        <Columns2Icon className="size-10" />
      </Button>
    <div
     className="flex flex-col gap-2 h-full w-full p-8"
    >
      <div
       className="flex md:flex-row flex-col gap-4"
      >
        <SensorFieldsCard/>
        <SystemStatusCard/>
      </div>
      <div className=" mt-4 pb-4">
        {/* <IoTChart/> */}
        <ChartTwo/>
      </div>
    </div>
  </div>;
};

export default IoTSensorsPage;
