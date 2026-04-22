"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import SelectState from "../../_components/select-state";
import { useTranslation } from "react-i18next";

export type WeatherEntry = {
  dt: number;
  main: {
    temp: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
};

export type WeatherData = {
  list: WeatherEntry[];
};

interface WeatherPageCardProps {
  WeatherIcon: React.ElementType;
  currentWeather: WeatherEntry | null;
}

export const WeatherPageCard = ({
  WeatherIcon,
  currentWeather,
}: WeatherPageCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className=" p-0 md:w-72 bg-secondary flex-grow md:max-w-[calc(100%-50%)]">
      <CardHeader>
        <div className="flex justify-between items-center gap-2">
          <h2 className=" text-sm font-semibold">
            {t("weatherData.currentWeatherTitle")}
          </h2>
          <SelectState />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <WeatherIcon className="h-12 w-12 text-yellow-500 mr-2" />
            <div className="text-primary text-2xl font-semibold">
              <p className="">
                {currentWeather?.weather[0].main ? t("weatherData." + (currentWeather?.weather[0].main)): "Loading..."}
              </p>
              <p className="text-[0.9rem] -mt-2 font-normal text-primary/60">
                {currentWeather?.weather[0].description ?? "Loading..."}
              </p>
            </div>
          </div>
          <div className="text-primary text-3xl font-semibold flex flex-col justify-start">
            {Math.round(currentWeather?.main.temp ?? 0)}°C
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
