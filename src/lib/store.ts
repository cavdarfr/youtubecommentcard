import { create } from "zustand";

export type CardSize = "small" | "medium" | "large" | "xlarge";

export interface CardOptions {
    size: CardSize;
    padding: number;
    showAuthorImage: boolean;
    showLikeCount: boolean;
    backgroundColor: string;
    textColor: string;
    cardRadius: number;
    dateFormat: string;
    fontSize: number;
    scaleFactor: number;
}

interface CardStore {
    cardOptions: CardOptions;
    setCardOptions: (options: Partial<CardOptions>) => void;
}

export const useCardStore = create<CardStore>((set) => ({
    cardOptions: {
        size: "medium",
        padding: 24,
        showAuthorImage: true,
        showLikeCount: false,
        backgroundColor: "#ffffff",
        textColor: "#000000",
        cardRadius: 12,
        dateFormat: "fr",
        fontSize: 16,
        scaleFactor: 2,
    },
    setCardOptions: (options) =>
        set((state) => ({
            cardOptions: { ...state.cardOptions, ...options },
        })),
}));
