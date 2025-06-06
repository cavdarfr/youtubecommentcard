import { NextResponse } from "next/server";
import { getYoutubeComments, YouTubeAPIError } from "@/lib/youtube";

export async function GET(request: Request) {
    try {
        // Get the comment ID from the URL
        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get("id");

        if (!commentId) {
            return NextResponse.json(
                { error: "Comment ID is required" },
                { status: 400 }
            );
        }
        // Fetch the comment
        const response = await getYoutubeComments(commentId);

        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof YouTubeAPIError) {
            if (error.statusCode === 429) {
                console.warn("Quota limit reached:", error.message);
            } else {
                console.error("YouTubeAPIError:", error.message);
            }
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode || 500 }
            );
        }
        console.error("Unexpected error fetching comment:", error);
        return NextResponse.json(
            { error: "Failed to fetch comment" },
            { status: 500 }
        );
    }
}
