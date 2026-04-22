import { create } from "zustand";

interface ImageUrlStore {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

export const useImageUrlStore = create<ImageUrlStore>((set) => ({
  imageUrl: null,
  setImageUrl: (url) => set({ imageUrl: url }),
}));
