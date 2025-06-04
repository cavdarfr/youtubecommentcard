"use client";

import { useState } from "react";
import { FormInput, FormCheckbox, FormSelect } from "./ui/form";
import { Button } from "./ui/button";
import { useCardStore } from "@/lib/store";
import { TutorialDialog } from "./TutorialDialog";

interface CommentFormProps {
    onSubmit: (url: string) => Promise<void>;
    loading: boolean;
}

export function CommentForm({ onSubmit, loading }: CommentFormProps) {
    const [url, setUrl] = useState(
        "https://www.youtube.com/watch?v=zcjppaYpH-Y&lc=Ugx90rGY_MjYdvHhAUZ4AaABAg"
    );
    const { cardOptions, setCardOptions } = useCardStore();

    const handleFetchComment = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(url);
    };

    const verticalAlignOptions = [
        { value: "start", label: "Top" },
        { value: "center", label: "Center" },
        { value: "end", label: "Bottom" },
    ];

    const dateFormatOptions = [
        { value: "fr", label: "French Format (DD/MM/YYYY)" },
        { value: "us", label: "US Format (MM/DD/YYYY)" },
    ];

    return (
        <div className="w-full">
            <form className="space-y-4" onSubmit={handleFetchComment}>
                <FormInput
                    id="url"
                    label="YouTube Comment URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter YouTube comment URL"
                    infoIcon={
                        <TutorialDialog>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800 focus:outline-none"
                                aria-label="How to get YouTube comment URL"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </TutorialDialog>
                    }
                />

                <div className="space-y-4">
                    <FormCheckbox
                        id="autoSize"
                        label="Auto Size"
                        checked={cardOptions.autoSize}
                        onChange={(e) =>
                            setCardOptions({
                                autoSize: e.target.checked,
                            })
                        }
                    />

                    {!cardOptions.autoSize && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                id="width"
                                label="Width (px)"
                                type="number"
                                value={cardOptions.width}
                                onChange={(e) =>
                                    setCardOptions({
                                        width: Number(e.target.value),
                                    })
                                }
                                min="200"
                                max="1200"
                            />
                            <FormInput
                                id="height"
                                label="Height (px)"
                                type="number"
                                value={cardOptions.height}
                                onChange={(e) =>
                                    setCardOptions({
                                        height: Number(e.target.value),
                                    })
                                }
                                min="100"
                                max="800"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            id="cardRadius"
                            label="Card Radius (px)"
                            type="number"
                            value={cardOptions.cardRadius}
                            onChange={(e) =>
                                setCardOptions({
                                    cardRadius: Number(e.target.value),
                                })
                            }
                            min="0"
                            max="64"
                        />
                        <FormInput
                            id="backgroundColor"
                            label="Background Color"
                            type="color"
                            value={cardOptions.backgroundColor}
                            onChange={(e) =>
                                setCardOptions({
                                    backgroundColor: e.target.value,
                                })
                            }
                            style={{ height: "38px" }}
                        />
                    </div>

                    <FormInput
                        id="fontSize"
                        label={`Font Size Adjustment (${
                            cardOptions.fontSize >= 0 ? "+" : ""
                        }${cardOptions.fontSize}px)`}
                        type="range"
                        value={cardOptions.fontSize}
                        onChange={(e) =>
                            setCardOptions({
                                fontSize: Number(e.target.value),
                            })
                        }
                        min="-5"
                        max="10"
                        step="1"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            id="verticalAlign"
                            label="Vertical Alignment"
                            options={verticalAlignOptions}
                            value={cardOptions.verticalAlign}
                            onChange={(e) =>
                                setCardOptions({
                                    verticalAlign: e.target.value,
                                })
                            }
                        />
                        <FormInput
                            id="padding"
                            label="Padding (px)"
                            type="number"
                            value={cardOptions.padding}
                            onChange={(e) =>
                                setCardOptions({
                                    padding: Number(e.target.value),
                                })
                            }
                            min="0"
                            max="64"
                        />
                    </div>

                    <FormSelect
                        id="dateFormat"
                        label="Date Format"
                        options={dateFormatOptions}
                        value={cardOptions.dateFormat}
                        onChange={(e) =>
                            setCardOptions({
                                dateFormat: e.target.value,
                            })
                        }
                    />

                    <FormCheckbox
                        id="showAuthorImage"
                        label="Show Author Image"
                        checked={cardOptions.showAuthorImage}
                        onChange={(e) =>
                            setCardOptions({
                                showAuthorImage: e.target.checked,
                            })
                        }
                    />

                    <FormCheckbox
                        id="showLikeCount"
                        label="Show Like Count"
                        checked={cardOptions.showLikeCount}
                        onChange={(e) =>
                            setCardOptions({
                                showLikeCount: e.target.checked,
                            })
                        }
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? "Loading..." : "Fetch Comment"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
