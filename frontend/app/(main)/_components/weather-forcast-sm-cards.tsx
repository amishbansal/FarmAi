import { Cloud, CloudRain, CloudSnow, Sun } from "lucide-react";
import React from "react";

interface Props {
  day: string;
  temperature: string;
  weather: "clear" | "clouds" | "rain" | "snow";
}

export const WeatherForcastSmCards = ({ day, temperature, weather }: Props) => {
  return (
    <div className="flex flex-col max-h-20">
      <p className="text-primary text-sm font-semibold">{day}</p>
      {weather === "clear" ? (
        <Sun className="h-7 w-7 text-yellow-500" />
      ) : weather === "clouds" ? (
        <Cloud className="h-7 w-7 text-gray-500" />
      ) : weather === "rain" ? (
        <CloudRain className="h-7 w-7 text-blue-500" />
      ) : weather === "snow" ? (
        <CloudSnow className="h-7 w-7 text-blue-500" />
      ) : null}
      <p className="text-primary text-sm font-semibold">{temperature}</p>
    </div>
  );
};
