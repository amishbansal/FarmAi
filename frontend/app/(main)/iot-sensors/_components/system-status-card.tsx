"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleCheckBig } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export const SystemStatusCard = () => {
  const { t } = useTranslation();

  return (
    <Card className=" bg-secondary flex-grow md:max-w-[calc(100%-50%)]">
      <CardHeader>
        <h2 className=" font-semibold text-sm md:text-lg">
          {t("iotdata.systemStatusTitle")}
        </h2>
      </CardHeader>
      <CardContent>
        <Card className="mb-2 ">
          <CardContent className="mt-4 flex items-center gap-2">
            <CircleCheckBig className=" size-8 text-green-700 md:block hidden" />
            <div className="ml-1">
              <p className=" text-green-900 font-semibold text-sm">
                {t("iotdata.allSystemsOperational")}
              </p>
              <p className=" text-green-700 text-xs">{t("iotdata.lastChecked")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2 w-full">
          <Card className="flex-grow">
            <CardContent>
              <p className=" mt-4 text-primary/70">{t("iotdata.batteryLevel")}</p>
              <p className=" text-2xl font-semibold">85%</p>
            </CardContent>
          </Card>
          <Card className="flex-grow">
            <CardContent>
              <p className=" mt-4 text-primary/70">{t("iotdata.signalStrength")}</p>
              <p className=" text-2xl font-semibold">{t("iotdata.strong")}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
