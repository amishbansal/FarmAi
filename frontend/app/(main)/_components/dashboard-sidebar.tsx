"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import { SelectLanguage } from "./select-language";
import { Notifications } from "./notifications";
import { ModeToggle } from "@/components/ui/theme-switcher";
import { WeatherCard } from "./weather-card";
import { MarketPriceItem } from "./market-price-item";
import { IoTSensorsDetailsCardTwo } from "./iot-sensors-details-two";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import SelectState from "./select-state";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "@/config/config";

interface MarketPriceData {
  State: string;
  District: string;
  Market: string;
  Commodity: string;
  variety: string;
  Grade: string;
  Arrival_date: string;
  MinPrice: string;
  MaxPrice: string;
  ModalPrice: string;
}

export const DashboardSidebar = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/market-prices`
        ); // Your own backend API endpoint

        let records = response.data;
        console.log(records);

        // Shuffle array to randomize selection
        records = records.sort(() => 0.5 - Math.random());

        // Pick first 3 commodities randomly
        const selectedCommodities = records.slice(0, 3);
        console.log(selectedCommodities);

        setMarketPrices(selectedCommodities);
      } catch (err) {
        console.error("Failed to fetch market prices:", err);
        setError("Failed to fetch market prices");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketPrices();
  }, []);

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="w-full flex justify-end items-center my-2 pr-4 gap-2">
          <Notifications />
          <SelectLanguage />
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-3 border-b border-t">
          <h2 className="text-lg text-primary/70">{t("dashSidebar.title")}</h2>
        </div>
        <div className="px-3 py-2 flex flex-col justify-start gap-4">
          <div>
            <div className=" flex w-full justify-between items-center mb-2">
              <h3 className="mb-1 text-sm font-semibold">
                {t("dashSidebar.weatherTitle")}
              </h3>

              <SelectState />
            </div>
            <WeatherCard />
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">
              {t("dashSidebar.marketTitle")}
            </h3>
            {loading ? (
              // Skeleton of 3 items
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className=" bg-secondary-foreground/15 h-14 flex mb-2"
                >
                  {/* Add more similar skeleton */}
                </Skeleton>
              ))
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {marketPrices.map((item, index) => (
                  <MarketPriceItem
                    key={index}
                    Name={item.Commodity}
                    price={parseInt(item.ModalPrice)}
                    district={item.District}
                    img={
                      item.Commodity.includes("Cabbage")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755426/farmai-images/fttl1yx91wenqkdis3nv.png"
                        : item.Commodity.includes("Onion")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755737/farmai-images/fwjp66njh1pnidk1eyyn.png"
                        : item.Commodity.includes("Tomato")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/tewmqawbkhnd850kke9e.png"
                        : item.Commodity.includes("Brinjal")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755426/farmai-images/ynmx1okwxaspyiyxiide.png"
                        : item.Commodity.includes("Banana")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/bgfb9maxafo6kcmexchv.webp"
                        : item.Commodity.includes("Potato")
                        ? "https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755426/farmai-images/shzqkwuiw9shhkd63b0d.png"
                        : "./farmlogo.svg"
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">{t("iotdata.title")}</h3>
            <div className="flex flex-col gap-2">
              <IoTSensorsDetailsCardTwo />
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
