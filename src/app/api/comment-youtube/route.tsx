import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { sharedCardStyle } from "@/lib/cardStyle";

export const runtime = "edge";

function getNumberParam(param: string | null, fallback: number) {
    const n = Number(param);
    return isNaN(n) || n < 0 ? fallback : n;
}

function estimateTextHeight(
    text: string,
    width: number,
    fontSize: number,
    padding: number
) {
    // More accurate character width calculation for the font family we're using
    const avgCharWidth = fontSize * 0.55; // Slightly more accurate for system fonts
    const availableWidth = width - padding * 2;
    const charsPerLine = Math.floor(availableWidth / avgCharWidth);

    // Handle line breaks explicitly
    const lines = text.split("\n");
    let totalLines = 0;

    for (const line of lines) {
        if (line.trim().length === 0) {
            totalLines += 1; // Empty line
        } else {
            const linesForThisText = Math.max(
                1,
                Math.ceil(line.length / charsPerLine)
            );
            totalLines += linesForThisText;
        }
    }

    const lineHeight = fontSize * 1.5;
    return totalLines * lineHeight;
}

function decodeHtmlEntities(text: string): string {
    return text.replace(/&#(\d+);|&([a-z]+);/gi, (match, dec, entity) => {
        if (dec) {
            return String.fromCharCode(dec);
        }
        const entities: { [key: string]: string } = {
            amp: "&",
            lt: "<",
            gt: ">",
            quot: '"',
            apos: "'",
            nbsp: " ",
            hellip: "...",
            mdash: "\u2014",
            ndash: "\u2013",
            rsquo: "\u2019",
            lsquo: "\u2018",
            rdquo: "\u201d",
            ldquo: "\u201c",
        };
        return entities[entity.toLowerCase()] || match;
    });
}

function processHtmlContent(text: string): string {
    // First, handle common HTML tags
    const processed = text
        // Convert <br> and <br/> tags to line breaks
        .replace(/<br\s*\/?>/gi, "\n")
        // Convert <p> tags to line breaks with extra spacing
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<p[^>]*>/gi, "")
        // Handle other block-level elements
        .replace(/<\/(div|blockquote|h[1-6])>/gi, "\n")
        .replace(/<(div|blockquote|h[1-6])[^>]*>/gi, "")
        // Remove other common HTML tags but preserve their content
        .replace(/<\/?(?:strong|b|em|i|u|span|a|code|pre)[^>]*>/gi, "")
        // Remove any remaining HTML tags
        .replace(/<[^>]*>/g, "")
        // Clean up multiple consecutive newlines (max 2 consecutive)
        .replace(/\n{3,}/g, "\n\n")
        // Clean up spaces around newlines
        .replace(/[ \t]*\n[ \t]*/g, "\n")
        // Trim whitespace from start and end
        .trim();

    // Then decode HTML entities
    return decodeHtmlEntities(processed);
}

function renderTextWithLineBreaks(text: string) {
    // Convert newlines to spaces and let CSS handle the display
    return text.replace(/\n/g, "\n");
}

function formatDate(dateString: string, format: string): string {
    const date = new Date(dateString);
    if (format === "fr") {
        return date.toLocaleDateString("fr-FR");
    } else {
        return date.toLocaleDateString("en-US");
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const commentData = searchParams.get("data");
        if (!commentData) {
            return new Response("Missing comment data", { status: 400 });
        }
        const comment = JSON.parse(commentData);
        // Get params with defaults
        const fontSizeAdjustment = getNumberParam(
            searchParams.get("fontSize"),
            0
        );
        const autoSize = searchParams.get("autoSize") === "1";
        const baseWidth = getNumberParam(searchParams.get("width"), 600);
        const baseHeight = getNumberParam(searchParams.get("height"), 400);
        const aspectRatio =
            getNumberParam(searchParams.get("aspectRatio"), 0) || undefined;
        const backgroundColor = searchParams.get("backgroundColor") || "#fff";
        const showAuthorImage = searchParams.get("showAuthorImage") !== "0";
        const cardRadius = getNumberParam(searchParams.get("cardRadius"), 8);
        const textColor = searchParams.get("textColor") || "#000";
        const showLikeCount = searchParams.get("showLikeCount") !== "0";
        const padding = getNumberParam(searchParams.get("padding"), 20);
        const dateFormat = searchParams.get("dateFormat") || "us";
        let verticalAlign = searchParams.get("verticalAlign") || "center";
        if (!["start", "center", "end"].includes(verticalAlign)) {
            verticalAlign = "center";
        }

        // Apply scale to all size-related properties
        const width = baseWidth * scale;
        const height = baseHeight * scale;

        const cardRadius = baseCardRadius * scale;
        const fontSize = baseFontSize * scale;
        const padding = basePadding * scale;

        // Guard: width and height must be valid positive integers if not autoSize
        if (
            !autoSize &&
            (!Number.isFinite(width) ||
                !Number.isFinite(height) ||
                width <= 0 ||
                height <= 0)
        ) {
            return new Response("Invalid image size", { status: 400 });
        }

        let finalWidth = width;
        let finalHeight = height;

        if (autoSize) {
            // Use the provided width or a sensible default/minimum
            finalWidth = Math.max(width, 400);

            // For auto-size, we'll let the content determine the minimum height
            // and then apply aspect ratio constraints if needed

            // Calculate a generous base height that accounts for all elements
            const baseHeaderHeight = showAuthorImage ? 60 * scale : 45 * scale;
            const baseLikeCountHeight = showLikeCount ? 45 * scale : 0;
            const processedTextForHeight = processHtmlContent(
                comment.snippet.textDisplay
            );

            // Use a more generous text height calculation
            const estimatedTextHeight = estimateTextHeight(
                processedTextForHeight,
                finalWidth,
                fontSizes.comment,
                padding
            );

            // Add generous spacing and buffer
            const spacingBuffer = 60 * scale; // Extra buffer for spacing
            const minContentHeight = Math.max(
                baseHeaderHeight +
                    estimatedTextHeight +
                    baseLikeCountHeight +
                    padding * 2 +
                    spacingBuffer,
                150 * scale // Absolute minimum
            );

            // Apply aspect ratio if specified, but with a minimum content height
            if (aspectRatio && aspectRatio > 0) {
                const aspectRatioHeight = finalWidth / aspectRatio;
                // Always use the larger value - never crop content
                finalHeight = Math.max(aspectRatioHeight, minContentHeight);
            } else {
                finalHeight = minContentHeight;
            }
        } else {
            // For fixed size mode, still apply content-aware logic
            if (aspectRatio && aspectRatio > 0) {
                const aspectRatioHeight = width / aspectRatio;

                // Calculate minimum required height for content
                const baseHeaderHeight = showAuthorImage
                    ? 60 * scale
                    : 45 * scale;
                const baseLikeCountHeight = showLikeCount ? 45 * scale : 0;
                const processedTextForHeight = processHtmlContent(
                    comment.snippet.textDisplay
                );
                const estimatedTextHeight = estimateTextHeight(
                    processedTextForHeight,
                    width,
                    fontSize,
                    padding
                );
                const spacingBuffer = 60 * scale;
                const minContentHeight = Math.max(
                    baseHeaderHeight +
                        estimatedTextHeight +
                        baseLikeCountHeight +
                        padding * 2 +
                        spacingBuffer,
                    150 * scale
                );

                // Use the larger of aspect ratio height or content required height
                finalHeight = Math.max(aspectRatioHeight, minContentHeight);
                finalWidth = width;
            }
        }

        finalWidth = Math.round(finalWidth);
        finalHeight = Math.round(finalHeight);

        // Instead of building cardStyle inline, use sharedCardStyle
        const cardStyle = sharedCardStyle({
            backgroundColor,
            textColor,
            fontFamily: "system-ui, Arial, sans-serif",
            fontWeight: "bold",
            fontSize: fontSizes.comment,
            padding,
            borderRadius: cardRadius,
            width: finalWidth,
            height: finalHeight,
            verticalAlign: verticalAlign as "start" | "center" | "end",
        });

        const decodedText = processHtmlContent(comment.snippet.textDisplay);
        return new ImageResponse(
            (
                <div style={cardStyle}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "100%",
                            height: "auto",
                            justifyContent: "flex-start",
                            gap: `${12 * scale}px`,
                        }}
                    >
                        {/* Header Section - Author info */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexShrink: 0,
                                minHeight: `${
                                    showAuthorImage ? 40 * scale : 24 * scale
                                }px`,
                            }}
                        >
                            {showAuthorImage && (
                                <img
                                    src={comment.snippet.authorProfileImageUrl}
                                    alt={comment.snippet.authorDisplayName}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        marginRight: `${12 * scale}px`,
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: `${4 * scale}px`,
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: `${fontSizes.authorName}px`,
                                        color: textColor,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {comment.snippet.authorDisplayName}
                                </div>
                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: `${14 * scale}px`,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {formatDate(
                                        comment.snippet.publishedAt,
                                        dateFormat
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Section - Comment text */}
                        <div
                            style={{
                                fontSize,
                                lineHeight: 1.5,
                                color: textColor,
                                fontWeight: "bold",
                                whiteSpace: "pre-line",
                                wordWrap: "break-word",
                                flex: "1 1 auto",
                                minHeight: "0",
                            }}
                        >
                            {renderTextWithLineBreaks(decodedText)}
                        </div>

                        {/* Footer Section - Like count */}
                        {showLikeCount && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexShrink: 0,
                                    minHeight: `${20 * scale}px`,
                                }}
                            >
                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: `${fontSizes.likeCount}px`,
                                        display: "flex",
                                        alignItems: "center",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    👍 {comment.snippet.likeCount} likes
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ),
            { width: finalWidth, height: finalHeight }
        );
    } catch (error) {
        console.error("Error generating image:", error);
        return new Response("Error generating image", { status: 500 });
    }
}
