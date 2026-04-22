import { ModeToggle } from "@/components/ui/theme-switcher";
import React from "react";
import { Notifications } from "./notifications";
import { SelectLanguage } from "./select-language";

export const Navbar = () => {
  return (
    <div className=" w-full flex justify-end items-center my-2 pr-4 gap-2">
      <SelectLanguage/>
      <Notifications />
      <ModeToggle />
    </div>
  );
};
