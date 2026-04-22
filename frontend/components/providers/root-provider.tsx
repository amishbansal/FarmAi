"use client";
import { Loader } from "lucide-react";
import React, { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "../ui/sidebar";
import { Toaster } from "../ui/sonner";
import "../../i18n";

interface RootProviderProps {
  children: ReactNode;
}

export const RootProvider = ({ children }: RootProviderProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className=" h-screen w-screen flex justify-center items-center">
        <Loader className=" animate-spin" />
      </div>
    );
  }
  return (
    <>
      <SidebarProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster 
           position="top-center"
          />
          {children}
        </ThemeProvider>
      </SidebarProvider>
    </>
  );
};
