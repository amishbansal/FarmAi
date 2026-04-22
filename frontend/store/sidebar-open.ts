import { create } from "zustand";

interface store {
  open: boolean;
  toggle: (states: string) => void;
}

export const useSidebarOpen = create<store>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
}));
