import { SidebarHeader } from "@/components/ui/sidebar";
import React from "react";

export const Dashboardbar = () => {
  return (
    <div className="w-64 h-full border rounded-md">
      <SidebarHeader>
        <h2 className="text-lg text-primary/80 p-1 px-3">Dashboard</h2>

        <hr className="border-primary/10" />
      </SidebarHeader>
    </div>
  );
};
