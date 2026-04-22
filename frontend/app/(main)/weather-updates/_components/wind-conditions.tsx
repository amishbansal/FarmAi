"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { useTranslation } from "react-i18next";

interface WindConditionsInterface{
    WindSpeed:string,
    WindDirection:string
}

export const WindConditions = ({
    WindDirection,
    WindSpeed
}:WindConditionsInterface) => {
  const { t } = useTranslation();
  return (
    <Card className=" p-0 md:w-72 bg-secondary flex-grow md:max-w-[calc(33.33%)]">
      <CardHeader>
        <div className="flex justify-between gap-2">
          <h2 className=" text-sm font-semibold">{t('weatherData.windConditionsTitle')}</h2>
        </div>
      </CardHeader>
      <CardContent className="flex w-full justify-between">
        <div
         className="flex flex-col gap-2"
        >
            <p
             className="text-xs text-secondary-foreground/70"
            >{t('weatherData.WindSpeed')}</p>
            <p
             className="font-semibold text-xl"
            >
                {WindSpeed ? WindSpeed :"Loading"} {t('weatherData.Speed')}
            </p>
        </div>
        <div
         className="flex flex-col gap-2"
        >
            <p
             className="text-xs text-secondary-foreground/70 font-sem" 
            >{t('weatherData.WindDirection')}</p>
            <p
             className="font-semibold text-xl"
             
            >
                {WindDirection}
            </p>
        </div>
      </CardContent>
    </Card>
  );
};
