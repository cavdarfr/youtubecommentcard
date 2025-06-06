import { youtube } from "@googleapis/youtube";
import { checkAndIncrementQuota, resetQuotaIfNeeded } from "./youtube-quota";

const client = youtube({
    auth: process.env.YOUTUBE_API_KEY,
    version: "v3",
});

if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured");
}

export class YouTubeAPIError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = "YouTubeAPIError";
    }
}

export const getYoutubeComments = async (commentId: string) => {
    try {
        await resetQuotaIfNeeded();
        try {
            await checkAndIncrementQuota();
        } catch {
            throw new YouTubeAPIError(
                "Daily usage limit reached. Please try again tomorrow. (API quota for YouTube exceeded)",
                429
            );
        }
        const response = await client.comments.list({
            part: ["snippet"],
            id: [commentId],
        });
        return response.data;
    } catch (error: unknown) {
        // Handle API errors
        const apiError = error as { code?: number; message?: string };

        // Handle specific error cases
        switch (apiError.code) {
            case 403:
                throw new YouTubeAPIError(
                    "YouTube API quota exceeded. Please try again later.",
                    403
                );
            case 404:
                throw new YouTubeAPIError(
                    "Comment not found. Please check the URL and try again.",
                    404
                );
            case 400:
                throw new YouTubeAPIError(
                    "Invalid comment ID. Please check the URL and try again.",
                    400
                );
            case 401:
                throw new YouTubeAPIError(
                    "YouTube API authentication failed. Please contact support.",
                    401
                );
            case 429:
                throw new YouTubeAPIError(
                    "Too many requests. Please try again later.",
                    429
                );
            default:
                // Handle general errors
                throw new YouTubeAPIError(
                    apiError.message ||
                        "Failed to fetch comment from YouTube API",
                    apiError.code || 500
                );
        }
    }
};
