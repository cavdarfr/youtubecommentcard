import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

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

function generateHTML(
    comment: {
        snippet: {
            authorProfileImageUrl: string;
            authorDisplayName: string;
            publishedAt: string;
            textDisplay: string;
            likeCount: number;
        };
    },
    width: number,
    backgroundColor: string,
    textColor: string,
    showAuthorImage: boolean,
    showLikeCount: boolean,
    cardRadius: number,
    padding: number,
    dateFormat: string,
    processedText: string
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comment Card</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: transparent;
            padding: 0;
            margin: 0;
        }
        
        .card {
            background-color: ${backgroundColor};
            color: ${textColor};
            font-size: 16px;
            line-height: 1.5;
            padding: ${padding}px;
            border-radius: ${cardRadius}px;
            width: ${width}px;
            display: flex;
            flex-direction: column;
            min-height: 150px;
        }
        
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
        }
        
        .author-info {
            display: flex;
            flex-direction: column;
        }
        
        .author-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 2px;
        }
        
        .publish-date {
            color: #666;
            font-size: 14px;
        }
        
        .content {
            white-space: pre-line;
            word-wrap: break-word;
            line-height: 1.5;
            flex: 1;
        }
        
        .footer {
            display: flex;
            align-items: center;
            color: #666;
            font-size: 14px;
            margin-top: 6px;
        }
        
        .like-icon {
            margin-right: 4px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            ${
                showAuthorImage
                    ? `
                <img src="${comment.snippet.authorProfileImageUrl}" 
                     alt="Avatar" 
                     class="avatar" />
            `
                    : ""
            }
            <div class="author-info">
                <div class="author-name">${
                    comment.snippet.authorDisplayName
                }</div>
                <div class="publish-date">${formatDate(
                    comment.snippet.publishedAt,
                    dateFormat
                )}</div>
            </div>
        </div>
        
        <div class="content">${processedText}</div>
        
        ${
            showLikeCount
                ? `
            <div class="footer">
                <span class="like-icon">👍</span>
                ${comment.snippet.likeCount} likes
            </div>
        `
                : ""
        }
    </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
    let browser;

    try {
        const { searchParams } = new URL(req.url);
        const commentData = searchParams.get("data");

        if (!commentData) {
            return new NextResponse("Missing comment data", { status: 400 });
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

        // Process text
        const processedText = processHtmlContent(comment.snippet.textDisplay);

        // Generate HTML content for the card
        const htmlContent = generateHTML(
            comment,
            width,
            backgroundColor,
            textColor,
            showAuthorImage,
            showLikeCount,
            cardRadius,
            padding,
            dateFormat,
            processedText
        );

        // Launch Puppeteer browser
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
            ],
        });

        const page = await browser.newPage();

        // Set viewport to a reasonable size
        await page.setViewport({
            width: Math.max(width + 100, 1200),
            height: 1200,
            deviceScaleFactor: 2, // For better image quality
        });

        // Set the HTML content
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        // Find the card element and get its bounding box
        const cardElement = await page.$(".card");
        if (!cardElement) {
            throw new Error("Card element not found");
        }

        // Get the actual rendered dimensions
        const boundingBox = await cardElement.boundingBox();
        if (!boundingBox) {
            throw new Error("Could not get card dimensions");
        }

        // Take screenshot of only the card element with auto-calculated height
        const screenshot = await cardElement.screenshot({
            type: "png",
            // Only set width, let height be calculated automatically based on content
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
            },
        });

        await browser.close();

        // Return the image with proper headers
        return new NextResponse(screenshot, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error(
            "Error generating card comment image with Puppeteer:",
            error
        );

        if (browser) {
            await browser.close();
        }

        return new NextResponse("Error generating image", { status: 500 });
    }
}
