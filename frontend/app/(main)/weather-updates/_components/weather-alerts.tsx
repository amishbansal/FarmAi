import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { weatherUpdates } from "@/lib/constants/weather-updates";
import React from "react";
import { useTranslation } from "react-i18next";

export const WeatherAlerts = () => {
  const { t } = useTranslation();

  const weatherUpdates = [
    {
      id: 1,
      title: t("weatherData.highUVIndexAlert"),
      description: t("weatherData.highUVIndexDescription"),
      type: "warning",
    },
    {
      id: 2,
      title: t("weatherData.wateringAdvisory"),
      description: t("weatherData.wateringAdvisoryDescription"),
      type: "info",
    },
  ];

  return (
    <Card className="max-w-full bg-secondary">
      <CardHeader className="text-lg">
        {t("weatherData.weatherAlertsTitle")}
      </CardHeader>
      <CardContent>
        {weatherUpdates.map((update) => (
          <div
            key={update.id}
            className={`p-4 mb-4 border-l-4 ${
              update.type === "warning"
                ? "border-yellow-500"
                : "border-blue-500"
            }`}
          >
            <h4 className="text-lg font-semibold">{update.title}</h4>
            <p className="text-sm text-secondary-foreground/70">
              {update.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
