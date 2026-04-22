"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { WeatherForcastSmCards } from "../../_components/weather-forcast-sm-cards";
import { WeatherEntry } from "./weather-page-card";
import { getLocalizedDay } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface WeeklyforecastProps {
  dailyForecasts: {
    [key: string]: WeatherEntry;
  };
}

export const WeeklyForecast = ({ dailyForecasts }: WeeklyforecastProps) => {
  const { i18n, t } = useTranslation();
  return (
    <Card className="p-0 md:w-72 bg-secondary flex-grow md:max-w-[calc(100%-50%)]">
      <CardHeader>
        <div className="flex justify-between gap-2">
          <h2 className=" text-sm font-semibold">
            {t("weatherData.weatherForecastTitle")}
          </h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {Object.values(dailyForecasts)
            .slice(0, 7)
            .map((data, index) => (
              <WeatherForcastSmCards
                key={index}
                day={getLocalizedDay(new Date(data.dt * 1000), i18n.language)}
                temperature={`${Math.round(data.main.temp)}°C`}
                weather={
                  data.weather[0].main.toLowerCase() as
                    | "clear"
                    | "clouds"
                    | "rain"
                    | "snow"
                }
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
