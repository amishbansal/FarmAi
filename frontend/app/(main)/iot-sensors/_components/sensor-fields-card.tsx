"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";
import { useTranslation } from "react-i18next";

export const SensorFieldsCard = () => {
  const { t } = useTranslation();

  return (
    <Card className=" bg-secondary flex-grow">
      <CardHeader className=" text-sm md:text-lg font-semibold">
        {t("iotdata.sensorFieldsTitle")}
      </CardHeader>
      <CardContent>
        <Card>
          <div className=" mb-3 p-3 rounded-md">
            <div className="flex justify-between mb-1">
              <p className=" text-xs md:text-sm">
                {t("iotdata.sensor1FieldA")}
              </p>
              <p className="text-green-500 font-semibold text-sm">
                {t("iotdata.activeStatus")}
              </p>
            </div>
            <div className=" flex justify-between gap-3 items-center">
              <Progress value={65} />
              <p>65%</p>
            </div>
          </div>
        </Card>

        <Card className=" mt-2">
          <div className=" mb-3 bg-primary-foreground p-3 rounded-md">
            <div className="flex justify-between mb-1">
              <p className=" text-sm">{t("iotdata.sensor1FieldB")}</p>
              <p className="text-green-500 font-semibold text-sm">
                {t("iotdata.activeStatus")}
              </p>
            </div>
            <div className=" flex justify-between gap-3 items-center">
              <Progress value={45} />
              <p>45%</p>
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
