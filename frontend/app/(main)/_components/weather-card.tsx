"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";
import { WeatherForcastSmCards } from "./weather-forcast-sm-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocationStore } from "@/store/location-store";
import { useTranslation } from "react-i18next";
import { getLocalizedDay } from "@/lib/utils";
import { WEATHER_API_KEY } from "@/config/config";

type WeatherEntry = {
  dt: number;
  main: {
    temp: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
};

type WeatherData = {
  list: WeatherEntry[];
};

const API_KEY = WEATHER_API_KEY;

const weatherIcons: Record<string, React.ElementType> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: Snowflake,
};

export const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useLocationStore();
  const { t, i18n } = useTranslation();

  console.log(i18n.language);
  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<WeatherData>(
        `https://api.openweathermap.org/data/2.5/forecast?q=${state}&units=metric&appid=${API_KEY}&lang=${i18n.language}`
      );
      console.log(response?.data);
      setWeatherData(response.data);
    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, [state, i18n.language]);

  useEffect(() => {
    console.log("running");
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
        const day = new Date(data.dt * 1000).toLocaleDateString(
          i18n.language == "en"
            ? "en-US"
            : i18n.language == "hi"
            ? "hi-IN"
            : i18n.language == "pi"
            ? "pa-IN"
            : "hi-IN",
          {
            weekday: "short",
          }
        );
        if (!acc[day]) acc[day] = data;
        return acc;
      },
      {}
    );
  }, [weatherData, i18n.language]);

  if (loading) {
    return (
      <Skeleton className="bg-secondary-foreground/15 h-32 flex justify-center items-center">
        {/* <p className="text-primary/70 text-xs">Loading Weather Data...</p> */}
      </Skeleton>
    );
  }

  if (error) {
    return (
      <Skeleton className="bg-secondary-foreground/15 h-32 flex justify-center items-center">
        <p className="text-primary text-lg font-semibold">{'Something went wrong'}</p>
      </Skeleton>
    );
  }

  return (
    <Card>
      <CardHeader className=" ">
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <WeatherIcon className="h-7 w-7 text-yellow-500" />
            <div className="text-primary text-sm font-semibold">
              {t("weatherData." + currentWeather?.weather[0].main)}
              <p className="text-[0.7rem] font-normal text-primary/70">
                {currentWeather?.weather[0].description}
              </p>
            </div>
          </div>
          <div className="text-primary text-xl font-semibold flex flex-col justify-start">
            {Math.round(currentWeather?.main.temp ?? 0)}°C
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {Object.values(dailyForecasts)
            .slice(0, 4)
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
