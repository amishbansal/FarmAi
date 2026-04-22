"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

interface MarketPriceItemProps {
  Name: string;
  price: number;
  img: string;
  district: string;
}
export const MarketPriceItem = ({
  Name,
  price,
  img,
  district,
}: MarketPriceItemProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="flex justify-between w-full items-center py-3 px-3 pr-4">
        <img
          src={img}
          alt={Name}
          width={35}
          height={35}
          className=" rounded-full"
        />

        <div className="flex flex-col flex-grow ml-2.5">
          <p className="text-primary font-semibold text-start text-sm">
            {t("market." + Name)}
          </p>
          <p className="text-primary/70 text-xs text-start">{t('market.marketPrice')}</p>
        </div>

        <div>
          <p
            className="text-primary font-semibold ml-auto text-green-500"
            style={{
              color: "green",
            }}
          >
            ₹{price}
          </p>
          <p className="text-primary/70 text-[0.6rem] ml-auto">
            {t("market.per_100kg")}
          </p>
        </div>
      </div>
      {/* </CardContent> */}
    </Card>
  );
};
