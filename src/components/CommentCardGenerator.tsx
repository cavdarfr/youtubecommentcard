"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentPreview } from "./CommentPreview";
import { generateCommentCard } from "@/lib/actions/generate-comment-card";

export function CommentCardGenerator() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<{
        width: number;
        height: number;
    } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        try {
            setLoading(true);
            setError(null);
            setPreviewUrl(null);
            setImageSize(null);

            const result = await generateCommentCard(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.previewUrl) {
                setPreviewUrl(result.previewUrl);
            }
        } catch (err) {
            console.error("Error generating comment card:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleImageLoad = (size: { width: number; height: number }) => {
        setImageSize(size);
    };

    const handleDownload = async () => {
        if (!previewUrl) return;

        try {
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "comment-card.png";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Error downloading image:", err);
            setError("Failed to download image");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <CommentForm onSubmit={handleSubmit} loading={loading} />
            </div>

            <div className="relative flex flex-1 flex-col gap-4 p-4 md:p-8 bg-amber-200/20 rounded-lg">
                {error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : previewUrl ? (
                    <CommentPreview
                        key={previewUrl} // Force re-mount when URL changes
                        previewUrl={previewUrl}
                        imageSize={imageSize}
                        onImageLoad={handleImageLoad}
                        onDownload={handleDownload}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                            <div className="text-lg mb-2">
                                No comment selected yet.
                            </div>
                            <div className="text-sm text-gray-400">
                                Enhanced with Puppeteer for better quality
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
