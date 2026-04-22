"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocationStore } from "@/store/location-store";
import React from "react";
import { useTranslation } from "react-i18next";

const SelectState = () => {
  const { set, state } = useLocationStore();
  const { t } = useTranslation();
  return (
    <Select value={state} onValueChange={set}>
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder={state} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Chandigarh" onChange={() => set("Chandigarh")}>
          {t("location.Chandigarh")}
        </SelectItem>
        <SelectItem value="Delhi" onClick={() => set("Delhi")}>
          {t("location.Delhi")}
        </SelectItem>
        <SelectItem value="Punjab" onClick={() => set("Punjab")}>
          {t("location.Punjab")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectState;
