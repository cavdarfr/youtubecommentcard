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
    const avgCharWidth = fontSize * 0.6;
    const charsPerLine = Math.floor((width - padding * 2) / avgCharWidth);
    const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
    const lineHeight = fontSize * 1.5;
    return lines * lineHeight;
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
        };
        return entities[entity.toLowerCase()] || match;
    });
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
        const scale = getNumberParam(searchParams.get("scale"), 1);
        const autoSize = searchParams.get("autoSize") === "1";
        const baseWidth = getNumberParam(searchParams.get("width"), 600);
        const baseHeight = getNumberParam(searchParams.get("height"), 200);
        const backgroundColor = searchParams.get("backgroundColor") || "#fff";
        const showAuthorImage = searchParams.get("showAuthorImage") !== "0";
        const baseCardRadius = getNumberParam(
            searchParams.get("cardRadius"),
            8
        );
        const textColor = searchParams.get("textColor") || "#000";
        const showLikeCount = searchParams.get("showLikeCount") !== "0";
        const baseFontSize = 16; // Base font size
        const basePadding = getNumberParam(searchParams.get("padding"), 20);
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

            // Estimate header and like count heights
            const headerHeight = (40 + 12) * scale; // avatar + margin
            const likeCountHeight = showLikeCount ? 26 * scale : 0;
            const textHeight = estimateTextHeight(
                comment.snippet.textDisplay,
                finalWidth,
                fontSize,
                padding
            );
            finalHeight = Math.max(
                headerHeight + textHeight + likeCountHeight + padding * 2,
                100 * scale
            );
        }

        finalWidth = Math.round(finalWidth);
        finalHeight = Math.round(finalHeight);

        // Instead of building cardStyle inline, use sharedCardStyle
        const cardStyle = sharedCardStyle({
            backgroundColor,
            textColor,
            fontFamily: "system-ui, Arial, sans-serif",
            fontWeight: "bold",
            fontSize,
            padding,
            borderRadius: cardRadius,
            width: finalWidth,
            height: finalHeight,
            verticalAlign: verticalAlign as "start" | "center" | "end",
        });

        const decodedText = decodeHtmlEntities(comment.snippet.textDisplay);

        return new ImageResponse(
            (
                <div style={cardStyle}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            justifyContent:
                                verticalAlign === "start"
                                    ? "flex-start"
                                    : verticalAlign === "end"
                                    ? "flex-end"
                                    : "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: `${12 * scale}px`,
                            }}
                        >
                            {showAuthorImage && (
                                <img
                                    src={comment.snippet.authorProfileImageUrl}
                                    alt={comment.snippet.authorDisplayName}
                                    style={{
                                        width: `${40 * scale}px`,
                                        height: `${40 * scale}px`,
                                        borderRadius: "50%",
                                        marginRight: `${12 * scale}px`,
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
                                        fontWeight: "bold",
                                        fontSize: `${16 * scale}px`,
                                        color: textColor,
                                    }}
                                >
                                    {comment.snippet.authorDisplayName}
                                </div>
                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: `${14 * scale}px`,
                                    }}
                                >
                                    {new Date(
                                        comment.snippet.publishedAt
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize,
                                lineHeight: "1.5",
                                display: "flex",
                                color: textColor,
                                fontWeight: "bold",
                                textAlign: "left",
                            }}
                        >
                            {decodedText}
                        </div>
                        {showLikeCount && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: `${12 * scale}px`,
                                }}
                            >
                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: `${14 * scale}px`,
                                        display: "flex",
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
