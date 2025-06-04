import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser, Page } from "puppeteer";

// Predefined card sizes
const CARD_SIZES = {
    small: 400,
    medium: 600,
    large: 800,
    xlarge: 1000,
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
    processedText: string,
    customFontSize?: number
): string {
    const fontSize = customFontSize || 16;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comment Card</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: transparent;
            padding: 0;
            margin: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .card {
            background-color: ${backgroundColor};
            color: ${textColor};
            font-size: ${fontSize}px;
            line-height: 1.5;
            padding: ${padding}px;
            border-radius: ${cardRadius}px;
            width: ${width}px;
            display: flex;
            flex-direction: column;
            min-height: 150px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        .author-info {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        
        .author-name {
            font-weight: 600;
            font-size: ${Math.round(fontSize * 1.1)}px;
            margin-bottom: 2px;
            color: ${textColor};
        }
        
        .publish-date {
            color: ${
                textColor === "#000000" ? "#666" : "rgba(255, 255, 255, 0.7)"
            };
            font-size: ${Math.round(fontSize * 0.875)}px;
            font-weight: 400;
        }
        
        .content {
            white-space: pre-line;
            word-wrap: break-word;
            line-height: 1.6;
            flex: 1;
            color: ${textColor};
            hyphens: auto;
            overflow-wrap: break-word;
        }
        
        .footer {
            display: flex;
            align-items: center;
            color: ${
                textColor === "#000000" ? "#666" : "rgba(255, 255, 255, 0.7)"
            };
            font-size: ${Math.round(fontSize * 0.875)}px;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid ${
                textColor === "#000000"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.1)"
            };
            flex-shrink: 0;
        }
        
        .like-icon {
            margin-right: 6px;
            font-size: ${Math.round(fontSize * 1.1)}px;
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
                     class="avatar" 
                     crossorigin="anonymous" />
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

async function createBrowser(): Promise<Browser> {
    const isDevelopment = process.env.NODE_ENV === "development";

    return await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-extensions",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-features=TranslateUI",
            "--disable-ipc-flooding-protection",
        ],
        ...(isDevelopment
            ? {}
            : {
                  executablePath:
                      process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
              }),
    });
}

async function generateCardImage(
    page: Page,
    htmlContent: string,
    width: number,
    scaleFactor: number = 2
): Promise<Buffer> {
    // Set viewport to accommodate the card with sufficient height for all content
    const viewportWidth = width + 100;
    // Increase viewport height to ensure all content fits properly
    const viewportHeight = Math.max(1200, width * 1.5);
    await page.setViewport({
        width: viewportWidth,
        height: viewportHeight,
        deviceScaleFactor: scaleFactor,
    });

    // Set the HTML content and wait for everything to load
    await page.setContent(htmlContent, {
        waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Find the card element
    const cardElement = await page.$(".card");
    if (!cardElement) {
        throw new Error("Card element not found");
    }

    // Take screenshot of just the card element with padding
    const screenshot = await cardElement.screenshot({
        type: "png",
        omitBackground: true,
    });

    return screenshot as Buffer;
}

export async function GET(req: NextRequest) {
    let browser: Browser | null = null;
    try {
        console.log("req.url", req.url);
        const { searchParams } = new URL(req.url);
        const commentData = searchParams.get("data");

        if (!commentData) {
            return new NextResponse("Missing comment data", { status: 400 });
        }

        const comment = JSON.parse(commentData);

        // Get parameters with enhanced defaults
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
        const customFontSize = getNumberParam(searchParams.get("fontSize"), 16);
        const scaleFactor = getNumberParam(searchParams.get("scaleFactor"), 2);

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
            processedText,
            customFontSize
        );

        // Create browser and generate image
        browser = await createBrowser();
        const page = await browser.newPage();

        const screenshot = await generateCardImage(
            page,
            htmlContent,
            width,
            scaleFactor
        );

        await browser.close();
        browser = null;

        // Return the image with proper headers
        return new NextResponse(screenshot, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Length": screenshot.length.toString(),
            },
        });
    } catch (error) {
        console.error(
            "Error generating card comment image with Puppeteer:",
            error
        );

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error("Error closing browser:", closeError);
            }
        }

        return new NextResponse("Error generating image", { status: 500 });
    }
}
