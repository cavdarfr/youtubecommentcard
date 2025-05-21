"use client";

import { useState } from "react";
import { FormInput, FormCheckbox, FormSelect } from "./ui/form";
import { Button } from "./ui/button";
import { useCardStore } from "@/lib/store";

interface CommentFormProps {
    onSubmit: (url: string) => Promise<void>;
    loading: boolean;
}

export function CommentForm({ onSubmit, loading }: CommentFormProps) {
    const [url, setUrl] = useState("");
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

    return (
        <div className="w-full">
            <form className="space-y-4" onSubmit={handleFetchComment}>
                <FormInput
                    id="url"
                    label="YouTube Comment URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter YouTube comment URL"
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
                        id="scale"
                        label={`Scale (${Math.round(
                            cardOptions.scale * 100
                        )}%)`}
                        type="range"
                        value={cardOptions.scale}
                        onChange={(e) =>
                            setCardOptions({
                                scale: Number(e.target.value),
                            })
                        }
                        min="0.5"
                        max="1.5"
                        step="0.1"
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
