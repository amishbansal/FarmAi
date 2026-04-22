import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellRing } from "lucide-react";
import React from "react";

export const Notifications = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <BellRing className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all   " />
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-2 w-52">
          <h2 className="text-sm font-semibold text-primary">Notifications</h2>
          <hr className="border-primary/10 mb-2" />
          <div className=" min-h-40 w-full">
            {
              //If there aare no notifications
              <div className=" pt-14 w-full flex flex-col justify-center items-center">
                No new notifications
              </div>
            }
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
