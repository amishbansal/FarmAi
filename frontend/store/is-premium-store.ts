import { create } from "zustand";

interface store {
  isPremium: boolean;
  set: (ispremium: boolean) => void;
}

export const usePremiumStore = create<store>((set) => ({
  isPremium: false,
  set: (ispremium: boolean) => set({ isPremium: ispremium }),
}));
