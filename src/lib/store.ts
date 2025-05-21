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
}

interface CardStore {
    cardOptions: CardOptions;
    setCardOptions: (options: Partial<CardOptions>) => void;
}

export const useCardStore = create<CardStore>((set) => ({
    cardOptions: {
        autoSize: true,
        width: 400,
        height: 200,
        scale: 1,
        verticalAlign: "start",
        padding: 20,
        showAuthorImage: true,
        showLikeCount: true,
        backgroundColor: "#ffffff",
        textColor: "#000000",
        cardRadius: 8,
    },
    setCardOptions: (options) =>
        set((state) => ({
            cardOptions: { ...state.cardOptions, ...options },
        })),
}));
