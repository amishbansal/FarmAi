"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebaroptions } from "@/lib/constants/sidebar";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Image from "next/image";
import React from "react";
import { IoTSensorsCard } from "./iot-sensors-card";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";


export const AppSidebar = () => {
  const param = usePathname();
  const router = useRouter();
   const { t } = useTranslation();

  return (
    <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-start py-2">
            <img
              src={"https://res.cloudinary.com/dabn2cnyh/image/upload/v1741755427/farmai-images/z6a2sxxvp0snggtly1yp.jpg"}
              alt="Farm Assistant"
              width={25}
              height={25}

              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-primary ml-2">
              {t('sidebar.title')}
            </h1>
            
          </div>
        </SidebarHeader>


      <SidebarContent>
        <SidebarMenu>
          {sidebaroptions.map((option) => (
            <SidebarMenuItem key={option.id} className=" px-2">
              <SidebarMenuButton
                onClick={() => router.push(option.href)}
                isActive={param == option.href}
              >
                <DynamicIcon
                  name={option.icon as IconName}
                  fill={option.fill ? "#000" : "transparent"}
                  className="h-4 w-4"
                />

                {t('sidebar.' + option.title)}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <IoTSensorsCard />
      </SidebarFooter>
    </Sidebar>
  );
};
