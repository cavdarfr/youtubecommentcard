export function extractCommentId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        // Handle different YouTube URL formats
        if (
            urlObj.hostname === "youtube.com" ||
            urlObj.hostname === "www.youtube.com"
        ) {
            // Extract comment ID from URL parameters
            const params = new URLSearchParams(urlObj.search);
            const commentId = params.get("lc");
            if (commentId) return commentId;
        }
        return null;
    } catch {
        return null;
    }
}

export function validateYouTubeUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (
            (urlObj.hostname === "youtube.com" ||
                urlObj.hostname === "www.youtube.com") &&
            urlObj.searchParams.has("lc")
        );
    } catch {
        return false;
    }
}
