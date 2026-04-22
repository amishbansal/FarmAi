import { create } from "zustand";

interface store {
  language: string;
  set: (language: string) => void;
}

export const useLanguageStore = create<store>((set) => ({
  language: "en",
  set: (newlanguage: string) => set({ language: newlanguage }),
}));
