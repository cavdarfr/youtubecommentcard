import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Predefined card sizes
const CARD_SIZES = {
    small: 400,
    medium: 600,
    large: 800,
} as const;

type CardSize = keyof typeof CARD_SIZES;

function getNumberParam(param: string | null, fallback: number): number {
    const n = Number(param);
    return isNaN(n) || n < 0 ? fallback : n;
}

function processHtmlContent(text: string): string {
    return text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/(div|blockquote|h[1-6])>/gi, "\n")
        .replace(/<(div|blockquote|h[1-6])[^>]*>/gi, "")
        .replace(/<\/?(?:strong|b|em|i|u|span|a|code|pre)[^>]*>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]*\n[ \t]*/g, "\n")
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
        .replace(/&([a-z]+);/gi, (match, entity) => {
            const entities: Record<string, string> = {
                amp: "&",
                lt: "<",
                gt: ">",
                quot: '"',
                apos: "'",
                nbsp: " ",
                hellip: "...",
                mdash: "—",
                ndash: "–",
                rsquo: "'",
                lsquo: "'",
                rdquo: "\u201d",
                ldquo: "\u201c",
            };
            return entities[entity.toLowerCase()] || match;
        })
        .trim();
}

function formatDate(dateString: string, format: string): string {
    const date = new Date(dateString);
    return format === "fr"
        ? date.toLocaleDateString("fr-FR")
        : date.toLocaleDateString("en-US");
}

function calculateHeight(
    text: string,
    width: number,
    fontSize: number,
    padding: number,
    showAuthorImage: boolean,
    showLikeCount: boolean
): number {
    // Estimate text dimensions more accurately
    const avgCharWidth = fontSize * 0.55;
    const availableWidth = width - padding * 2;
    const charsPerLine = Math.floor(availableWidth / avgCharWidth);

    const totalLines = text.split("\n").reduce((lines, line) => {
        return (
            lines +
            (line.trim().length === 0
                ? 1
                : Math.max(1, Math.ceil(line.length / charsPerLine)))
        );
    }, 0);

    const textHeight = totalLines * fontSize * 1.5;
    const headerHeight = showAuthorImage ? 52 : 36; // Reduced from 60/45
    const likeCountHeight = showLikeCount ? 20 : 0; // Reduced from 35
    const spacing = showLikeCount ? 24 : 12; // Reduced spacing, conditional

    return Math.max(
        150, // Reduced minimum height
        textHeight + headerHeight + likeCountHeight + spacing + padding * 2
    );
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const commentData = searchParams.get("data");

        if (!commentData) {
            return new Response("Missing comment data", { status: 400 });
        }

        const comment = JSON.parse(commentData);

        // Get parameters with simplified defaults
        const size = (searchParams.get("size") as CardSize) || "medium";
        const width = CARD_SIZES[size] || CARD_SIZES.medium;
        const backgroundColor =
            searchParams.get("backgroundColor") || "#ffffff";
        const textColor = searchParams.get("textColor") || "#000000";
        const showAuthorImage = searchParams.get("showAuthorImage") !== "0";
        const showLikeCount = searchParams.get("showLikeCount") !== "0";
        const cardRadius = getNumberParam(searchParams.get("cardRadius"), 12);
        const padding = getNumberParam(searchParams.get("padding"), 24);
        const dateFormat = searchParams.get("dateFormat") || "us";

        // Process text and calculate dimensions
        const processedText = processHtmlContent(comment.snippet.textDisplay);
        const height = calculateHeight(
            processedText,
            width,
            16,
            padding,
            showAuthorImage,
            showLikeCount
        );

        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor,
                        color: textColor,
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 16,
                        lineHeight: 1.5,
                        padding: padding,
                        borderRadius: cardRadius,
                        width: width,
                        height: height,
                        boxSizing: "border-box",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            {showAuthorImage && (
                                <img
                                    src={comment.snippet.authorProfileImageUrl}
                                    alt=""
                                    width="40"
                                    height="40"
                                    style={{
                                        borderRadius: "50%",
                                        marginRight: 12,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 16,
                                        marginBottom: 2,
                                    }}
                                >
                                    {comment.snippet.authorDisplayName}
                                </div>
                                <div style={{ color: "#666", fontSize: 14 }}>
                                    {formatDate(
                                        comment.snippet.publishedAt,
                                        dateFormat
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            style={{
                                whiteSpace: "pre-line",
                                wordWrap: "break-word",
                                lineHeight: 1.5,
                            }}
                        >
                            {processedText}
                        </div>
                    </div>

                    {/* Footer - Like count */}
                    {showLikeCount && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                color: "#666",
                                fontSize: 14,
                                marginTop: 6,
                            }}
                        >
                            👍 {comment.snippet.likeCount} likes
                        </div>
                    )}
                </div>
            ),
            {
                width,
                height,
                headers: {
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            }
        );
    } catch (error) {
        console.error("Error generating card comment image:", error);
        return new Response("Error generating image", { status: 500 });
    }
}
