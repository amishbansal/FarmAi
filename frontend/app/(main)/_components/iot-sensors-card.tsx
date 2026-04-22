"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sensorsData } from "@/lib/constants/sidebar";
import React from "react";
import { useTranslation } from "react-i18next";

export const IoTSensorsCard = () => {
  const { t } = useTranslation();
  return (
    <Card className=" ">
      <CardHeader className="-mb-3 -mt-2">
        {/* <h2 className="text-sm font-semibold text-primary">
          Connected Sensors
        </h2> */}
        <CardTitle
         className="text-sm font-semibold text-primary"
        >
        {t('sensors.title')}
        </CardTitle>
      </CardHeader>
      <hr className="border-primary/10 mb-2" />
      <CardContent>
        <div>
            
          {sensorsData.map((sensor) => {
            return (
              <p
                key={sensor.id}
                className="text-sm text-primary/80 w-full flex justify-between items-center"
              >
                {t('sensors.' + sensor.title)}
                <span className="text-green-500">{sensor.value}</span>
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
