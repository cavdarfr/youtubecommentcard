"use server";

import { extractCommentId } from "@/lib/utils/youtube";

interface GenerateCommentCardResult {
    previewUrl?: string;
    error?: string;
}

export async function generateCommentCard(
    formData: FormData
): Promise<GenerateCommentCardResult> {
    try {
        const url = formData.get("url") as string;
        const size = (formData.get("size") as string) || "medium";
        const backgroundColor =
            (formData.get("backgroundColor") as string) || "#ffffff";
        const textColor = (formData.get("textColor") as string) || "#000000";
        const showAuthorImage = formData.get("showAuthorImage") === "true";
        const showLikeCount = formData.get("showLikeCount") === "true";
        const cardRadius = parseInt(
            (formData.get("cardRadius") as string) || "12"
        );
        const padding = parseInt((formData.get("padding") as string) || "24");
        const dateFormat = (formData.get("dateFormat") as string) || "fr";
        const fontSize = parseInt((formData.get("fontSize") as string) || "16");
        const scaleFactor = parseInt(
            (formData.get("scaleFactor") as string) || "2"
        );

        if (!url) {
            return { error: "YouTube comment URL is required" };
        }

        const commentId = extractCommentId(url);
        if (!commentId) {
            return { error: "Please enter a valid YouTube comment URL" };
        }

        // Fetch the comment data
        const commentResponse = await fetch(
            `${
                process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            }/api/comment?id=${encodeURIComponent(commentId)}`,
            {
                cache: "no-store",
            }
        );

        if (!commentResponse.ok) {
            const errorData = await commentResponse.json();
            return { error: errorData.error || "Failed to fetch comment" };
        }

        const responseData = await commentResponse.json();
        const commentData = responseData.items?.[0];

        if (!commentData) {
            return { error: "No comment found" };
        }

        // Generate the preview URL with all parameters
        const params = new URLSearchParams({
            data: JSON.stringify(commentData),
            size,
            backgroundColor,
            textColor,
            showAuthorImage: showAuthorImage ? "1" : "0",
            showLikeCount: showLikeCount ? "1" : "0",
            cardRadius: cardRadius.toString(),
            padding: padding.toString(),
            dateFormat,
            fontSize: fontSize.toString(),
            scaleFactor: scaleFactor.toString(),
            _t: Date.now().toString(), // Cache busting parameter
        });

        const previewUrl = `/api/card-comment?${params.toString()}`;

        return { previewUrl };
    } catch (error) {
        console.error("Error in generateCommentCard:", error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred",
        };
    }
}
