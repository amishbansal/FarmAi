import { create } from "zustand";

interface store {
  isOpen: boolean;
  set: (isOpenChange: boolean) => void;
}

export const useUploaderOpen = create<store>((set) => ({
  isOpen: false,
  set: (isOpenChange: boolean) => set({ isOpen: isOpenChange }),
}));
