"use client";
import { DashboardSidebar } from "./(main)/_components/dashboard-sidebar";
import { Chatbot } from "./(main)/_components/chatbot";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Columns2Icon } from "lucide-react";

export default function Home() {
  const isMobile = useIsMobile();
  const { setOpen, open, toggleSidebar } = useSidebar();

  return (
    <div className="relative flex h-full w-full overflow-x-hidden items-start">
      <Button variant={'ghost'} size={'icon'} className="absolute top-2 left-2 z-10" onClick={toggleSidebar}>
        <Columns2Icon className="size-10" />
      </Button>
      {/* <AppSidebar /> */}
      {/* <div className="flex flex-col w-full h-full">
        <Navbar />
        <div
         className="flex h-full justify-end"
        >

        <Dashboardbar />
        </div>
      </div> */}

      <Chatbot />

      {!isMobile && <DashboardSidebar />}
    </div>
  );
}
