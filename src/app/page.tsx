"use client";

import { useState, useEffect, useCallback } from "react";
import { CommentForm } from "@/components/CommentForm";
import { Button } from "@/components/ui/button";
import { extractCommentId } from "@/lib/utils/youtube";
import { useCardStore } from "@/lib/store";
import Image from "next/image";

interface CommentData {
    snippet: {
        textDisplay: string;
        authorDisplayName: string;
        authorProfileImageUrl: string;
        likeCount: number;
        publishedAt: string;
    };
}

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentCommentData, setCurrentCommentData] =
        useState<CommentData | null>(null);
    const [imageSize, setImageSize] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const cardOptions = useCardStore((state) => state.cardOptions);

    const generatePreviewUrl = useCallback(
        (commentData: CommentData) => {
            const params = new URLSearchParams({
                data: JSON.stringify(commentData),
                backgroundColor: cardOptions.backgroundColor,
                showAuthorImage: cardOptions.showAuthorImage ? "1" : "0",
                cardRadius: cardOptions.cardRadius.toString(),
                textColor: cardOptions.textColor,
                showLikeCount: cardOptions.showLikeCount ? "1" : "0",
                padding: cardOptions.padding.toString(),
                verticalAlign: cardOptions.verticalAlign,
                autoSize: cardOptions.autoSize ? "1" : "0",
                scale: cardOptions.scale.toString(),
                dateFormat: cardOptions.dateFormat,
            });

            if (!cardOptions.autoSize) {
                params.set("width", cardOptions.width.toString());
                params.set("height", cardOptions.height.toString());
            }

            return `/api/comment-youtube?${params.toString()}`;
        },
        [cardOptions]
    );

    useEffect(() => {
        if (currentCommentData) {
            const newPreviewUrl = generatePreviewUrl(currentCommentData);
            setPreviewUrl(newPreviewUrl);
            setImageSize(null);
        }
    }, [cardOptions, currentCommentData, generatePreviewUrl]);

    const handleSubmit = async (url: string) => {
        try {
            setLoading(true);
            setError(null);
            setPreviewUrl(null);
            setImageSize(null);

            const commentId = extractCommentId(url);
            if (!commentId) {
                throw new Error("Please enter a valid YouTube comment URL");
            }

            // First, fetch the comment data
            const commentResponse = await fetch(
                `/api/comment?id=${encodeURIComponent(commentId)}`
            );
            if (!commentResponse.ok) {
                const errorData = await commentResponse.json();
                throw new Error(errorData.error || "Failed to fetch comment");
            }
            const responseData = await commentResponse.json();

            // Extract the actual comment from the response
            const commentData = responseData.items?.[0];
            if (!commentData) {
                throw new Error("No comment found");
            }

            setCurrentCommentData(commentData);
            setPreviewUrl(generatePreviewUrl(commentData));
            setImageSize(null);
        } catch (err) {
            console.error("Error fetching comment:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
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
        <div className="min-h-screen flex flex-col font-mono">
            {/* Header */}
            <header className="w-full border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-amber-200 p-2 rounded-lg">
                        <Image
                            src="/logo.png"
                            alt="Cavdar.fr Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h1 className="text-xl font-bold">
                            YouTube Comment Card
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <CommentForm
                                onSubmit={handleSubmit}
                                loading={loading}
                            />
                        </div>

                        <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-8 bg-[url('/pattern.png')] bg-repeat rounded-lg">
                            {error ? (
                                <div className="text-red-500 text-center">
                                    {error}
                                </div>
                            ) : previewUrl ? (
                                <>
                                    <div className="w-full">
                                        <div className="text-center mb-4 font-medium">
                                            Preview
                                        </div>
                                        <div
                                            className="relative overflow-auto"
                                            style={
                                                imageSize
                                                    ? {
                                                          width: `${imageSize.width}px`,
                                                          height: `${imageSize.height}px`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <Image
                                                src={previewUrl}
                                                alt="Comment Card Preview"
                                                onLoadingComplete={(img) =>
                                                    setImageSize({
                                                        width: img.naturalWidth,
                                                        height: img.naturalHeight,
                                                    })
                                                }
                                                width={imageSize?.width ?? 600}
                                                height={imageSize?.height ?? 400}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleDownload}
                                        className="w-full md:w-auto"
                                    >
                                        Download Comment Card
                                    </Button>
                                </>
                            ) : (
                                <div className="text-gray-500 text-center">
                                    No comment selected yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t mt-auto">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 bg-amber-200 p-2 rounded-lg">
                            <Image
                                src="/logo.png"
                                alt="Cavdar.fr Logo"
                                width={24}
                                height={24}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-600">
                                Generated by Cavdar.fr
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            © {new Date().getFullYear()} Cavdar.fr
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
