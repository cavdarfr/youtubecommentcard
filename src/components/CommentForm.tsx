"use client";

import { useForm, Controller } from "react-hook-form";
import { FormInput, FormCheckbox, FormSelect } from "./ui/form";
import { Button } from "./ui/button";
import { useCardStore } from "@/lib/store";
import type { CardSize } from "@/lib/store";
import { memo } from "react";

interface CommentFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
    loading: boolean;
}

interface CommentFormData {
    url: string;
    size: CardSize;
    cardRadius: number;
    padding: number;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    scaleFactor: number;
    dateFormat: string;
    showAuthorImage: boolean;
    showLikeCount: boolean;
}

const MemoizedFormInput = memo(FormInput);
const MemoizedFormSelect = memo(FormSelect);
const MemoizedFormCheckbox = memo(FormCheckbox);

export function CommentForm({ onSubmit, loading }: CommentFormProps) {
    const { cardOptions, setCardOptions } = useCardStore();

    const { control, handleSubmit } = useForm<CommentFormData>({
        defaultValues: {
            url: "",
            size: cardOptions.size,
            cardRadius: cardOptions.cardRadius,
            padding: cardOptions.padding,
            backgroundColor: cardOptions.backgroundColor,
            textColor: cardOptions.textColor,
            fontSize: cardOptions.fontSize,
            scaleFactor: cardOptions.scaleFactor,
            dateFormat: cardOptions.dateFormat,
            showAuthorImage: cardOptions.showAuthorImage,
            showLikeCount: cardOptions.showLikeCount,
        },
        mode: "onChange",
    });

    const handleFormSubmit = async (data: CommentFormData) => {
        // Update card options when form is submitted
        const newCardOptions = {
            size: data.size,
            cardRadius: data.cardRadius,
            padding: data.padding,
            backgroundColor: data.backgroundColor,
            textColor: data.textColor,
            fontSize: data.fontSize,
            scaleFactor: data.scaleFactor,
            dateFormat: data.dateFormat,
            showAuthorImage: data.showAuthorImage,
            showLikeCount: data.showLikeCount,
        };

        setCardOptions(newCardOptions);

        // Create FormData for server action
        const formData = new globalThis.FormData();
        formData.append("url", data.url);
        formData.append("size", data.size);
        formData.append("backgroundColor", data.backgroundColor);
        formData.append("textColor", data.textColor);
        formData.append("showAuthorImage", data.showAuthorImage.toString());
        formData.append("showLikeCount", data.showLikeCount.toString());
        formData.append("cardRadius", data.cardRadius.toString());
        formData.append("padding", data.padding.toString());
        formData.append("dateFormat", data.dateFormat);
        formData.append("fontSize", data.fontSize.toString());
        formData.append("scaleFactor", data.scaleFactor.toString());

        await onSubmit(formData);
    };

    const sizeOptions = [
        { value: "small", label: "Small (400px wide)" },
        { value: "medium", label: "Medium (600px wide)" },
        { value: "large", label: "Large (800px wide)" },
        { value: "xlarge", label: "X-Large (1000px wide)" },
    ];

    const dateFormatOptions = [
        { value: "us", label: "US Format (MM/DD/YYYY)" },
        { value: "fr", label: "French Format (DD/MM/YYYY)" },
    ];

    const scaleFactorOptions = [
        { value: "1", label: "Standard (1x)" },
        { value: "2", label: "High-DPI (2x)" },
        { value: "3", label: "Ultra High-DPI (3x)" },
    ];

    return (
        <div className="w-full">
            <form
                className="space-y-4"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <Controller
                    name="url"
                    control={control}
                    rules={{
                        required: "YouTube comment URL is required",
                        pattern: {
                            value: /youtube\.com|youtu\.be/,
                            message: "Please enter a valid YouTube URL",
                        },
                    }}
                    render={({ field }) => (
                        <MemoizedFormInput
                            id="url"
                            label="YouTube Comment URL"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter YouTube comment URL"
                        />
                    )}
                />

                <div className="space-y-4">
                    <Controller
                        name="size"
                        control={control}
                        render={({ field }) => (
                            <MemoizedFormSelect
                                id="size"
                                label="Card Size"
                                options={sizeOptions}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="cardRadius"
                            control={control}
                            rules={{ min: 0, max: 32 }}
                            render={({ field }) => (
                                <MemoizedFormInput
                                    id="cardRadius"
                                    label="Card Radius (px)"
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                    min="0"
                                    max="32"
                                />
                            )}
                        />
                        <Controller
                            name="padding"
                            control={control}
                            rules={{ min: 8, max: 48 }}
                            render={({ field }) => (
                                <MemoizedFormInput
                                    id="padding"
                                    label="Padding (px)"
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                    min="8"
                                    max="48"
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="backgroundColor"
                            control={control}
                            render={({ field }) => (
                                <MemoizedFormInput
                                    id="backgroundColor"
                                    label="Background Color"
                                    type="color"
                                    value={field.value}
                                    onChange={field.onChange}
                                    style={{ height: "38px" }}
                                />
                            )}
                        />
                        <Controller
                            name="textColor"
                            control={control}
                            render={({ field }) => (
                                <MemoizedFormInput
                                    id="textColor"
                                    label="Text Color"
                                    type="color"
                                    value={field.value}
                                    onChange={field.onChange}
                                    style={{ height: "38px" }}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="fontSize"
                            control={control}
                            rules={{ min: 12, max: 24 }}
                            render={({ field }) => (
                                <MemoizedFormInput
                                    id="fontSize"
                                    label="Font Size (px)"
                                    type="number"
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                    min="12"
                                    max="24"
                                />
                            )}
                        />
                        <Controller
                            name="scaleFactor"
                            control={control}
                            render={({ field }) => (
                                <MemoizedFormSelect
                                    id="scaleFactor"
                                    label="Image Quality"
                                    options={scaleFactorOptions}
                                    value={field.value.toString()}
                                    onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                    }
                                />
                            )}
                        />
                    </div>

                    <Controller
                        name="dateFormat"
                        control={control}
                        render={({ field }) => (
                            <MemoizedFormSelect
                                id="dateFormat"
                                label="Date Format"
                                options={dateFormatOptions}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="showAuthorImage"
                            control={control}
                            render={({ field }) => (
                                <MemoizedFormCheckbox
                                    id="showAuthorImage"
                                    label="Show Author Image"
                                    checked={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <Controller
                            name="showLikeCount"
                            control={control}
                            render={({ field }) => (
                                <MemoizedFormCheckbox
                                    id="showLikeCount"
                                    label="Show Like Count"
                                    checked={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={loading}
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating Card...
                            </>
                        ) : (
                            "Generate Comment Card"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
