"use client";
import { Card } from "@/components/ui/card";
import { sensorsData } from "@/lib/constants/sidebar";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import React from "react";
import { useTranslation } from "react-i18next";

export const IoTSensorsDetailsCardTwo = () => {
    const {t} = useTranslation();
  
  return (
    <Card>
      <div
       className="flex flex-col gap-2 p-3"
      >
        {sensorsData.map((data, index) => (
          <div key={index} className="flex justify-between items-center mr-2">
            <div className="flex flex-col">
              <p className="text-primary/70 text-sm">{t('sensors.'+data.title)}</p>
              <p className="text-primary font-semibold text-sm ">{data.value}</p>
            </div>
            <DynamicIcon
              name={data.icon as IconName}
              fill={data.fill}
              className="h-5 w-5"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
