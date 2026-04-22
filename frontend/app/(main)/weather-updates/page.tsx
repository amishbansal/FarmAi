"use client";
import { Cloud, CloudRain, Columns2Icon, Snowflake, Sun } from "lucide-react";
import { WeatherAlerts } from "./_components/weather-alerts";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  WeatherData,
  WeatherEntry,
  WeatherPageCard,
} from "./_components/weather-page-card";
import { WeatherForcastSmCards } from "../_components/weather-forcast-sm-cards";
import { WeeklyForecast } from "./_components/weekly-forecast";
import { WindConditions } from "./_components/wind-conditions";
import { useLocationStore } from "@/store/location-store";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { WEATHER_API_KEY } from "@/config/config";

const API_KEY = WEATHER_API_KEY;
const weatherIcons: Record<string, React.ElementType> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: Snowflake,
};
const WeatherUpdates = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleSidebar } = useSidebar();
  const { t, i18n } = useTranslation();

  const { state } = useLocationStore();

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/forecast?q=${state}&units=metric&appid=${API_KEY}&lang=${i18n.language}`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const currentWeather = useMemo(
    () => weatherData?.list[0] ?? null,
    [weatherData]
  );
  const WeatherIcon = useMemo(
    () =>
      currentWeather?.weather[0].main
        ? weatherIcons[currentWeather.weather[0].main]
        : Sun,
    [currentWeather]
  );

  const dailyForecasts = useMemo(() => {
    if (!weatherData) return {};
    return weatherData.list.reduce<{ [key: string]: WeatherEntry }>(
      (acc, data) => {
        const day = new Date(data.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!acc[day]) acc[day] = data;
        return acc;
      },
      {}
    );
  }, [weatherData]);

  return (
    <div className="relative flex h-full w-full overflow-x-hidden items-start pt-5">
      <Button
        variant={"ghost"}
        size={"icon"}
        className="absolute top-2 left-2 z-10"
        onClick={toggleSidebar}
      >
        <Columns2Icon className="size-10" />
      </Button>
      <div className="flex flex-col w-full h-full p-8 gap-4">
        <div className="flex md:flex-row flex-col w-full gap-4">
          <WeatherPageCard
            WeatherIcon={WeatherIcon}
            currentWeather={currentWeather}
          />
          <WeeklyForecast dailyForecasts={dailyForecasts} />
          <WindConditions
            WindSpeed={`${currentWeather?.wind?.speed}`}
            WindDirection="NE"
          />
        </div>
        <div className=" pb-5">
          <WeatherAlerts />
        </div>
      </div>
    </div>
  );
};

export default WeatherUpdates;
