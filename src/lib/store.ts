import { create } from "zustand";

export interface CardOptions {
    autoSize: boolean;
    width: number;
    height: number;
    scale: number;
    verticalAlign: string;
    padding: number;
    showAuthorImage: boolean;
    showLikeCount: boolean;
    backgroundColor: string;
    textColor: string;
    cardRadius: number;
    dateFormat: string;
}

interface CardStore {
    cardOptions: CardOptions;
    setCardOptions: (options: Partial<CardOptions>) => void;
}

export const useCardStore = create<CardStore>((set) => ({
    cardOptions: {
        autoSize: true,
        width: 600,
        height: 400,
        scale: 1,
        verticalAlign: "start",
        padding: 20,
        showAuthorImage: true,
        showLikeCount: true,
        backgroundColor: "#ffffff",
        textColor: "#000000",
        cardRadius: 8,
        dateFormat: "us",
    },
    setCardOptions: (options) =>
        set((state) => ({
            cardOptions: { ...state.cardOptions, ...options },
        })),
}));
