import {create} from 'zustand'

interface store {
    state:string;
    set: (states:string)=>void;
}

export const useLocationStore = create<store>((set)=>({
    state: "Chandigarh",
    set: (newState: string) => set({ state: newState })
}))