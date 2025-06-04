// Test utility for Puppeteer API routes
export const sampleCommentData = {
    snippet: {
        authorDisplayName: "John Doe",
        authorProfileImageUrl:
            "https://yt3.googleusercontent.com/ytc/AIf8zZTZYxaFmjCVLhwtNrQoZJNxj2y0i6bF4-QoYj1Vdw=s240-c-k-c0x00ffffff-no-rj",
        textDisplay:
            "This is an amazing video! I really enjoyed the explanations and the way you broke down complex concepts into simple terms. Keep up the great work! 🎉",
        publishedAt: "2024-01-15T10:30:00Z",
        likeCount: "42",
    },
};

export const longCommentData = {
    snippet: {
        authorDisplayName: "Sarah Wilson",
        authorProfileImageUrl:
            "https://yt3.googleusercontent.com/ytc/AIf8zZTZYxaFmjCVLhwtNrQoZJNxj2y0i6bF4-QoYj1Vdw=s240-c-k-c0x00ffffff-no-rj",
        textDisplay: `This video completely changed my perspective on web development! I've been struggling with React for months, and your explanation of hooks finally made everything click. 

The way you demonstrated useEffect with practical examples was brilliant. I especially loved the part about dependency arrays - that's something I always got confused about.

I've been following your channel for over a year now, and your content quality just keeps getting better. The production value, the clear explanations, and the practical examples make this one of the best programming channels on YouTube.

Can't wait for the next video in this series! Will you be covering custom hooks next? That would be incredibly helpful.

Thank you so much for sharing your knowledge with the community! 🚀✨`,
        publishedAt: "2024-01-20T14:22:00Z",
        likeCount: "156",
    },
};

// Function to generate test URLs for the API routes
export function generateTestUrl(
    baseUrl: string,
    commentData: typeof sampleCommentData,
    options: {
        size?: "small" | "medium" | "large" | "xlarge";
        backgroundColor?: string;
        textColor?: string;
        showAuthorImage?: boolean;
        showLikeCount?: boolean;
        cardRadius?: number;
        padding?: number;
        dateFormat?: "us" | "fr";
        fontSize?: number;
        scaleFactor?: number;
        maxWidth?: number;
    } = {}
): string {
    const params = new URLSearchParams();

    // Add comment data
    params.append("data", JSON.stringify(commentData));

    // Add optional parameters
    if (options.size) params.append("size", options.size);
    if (options.backgroundColor)
        params.append("backgroundColor", options.backgroundColor);
    if (options.textColor) params.append("textColor", options.textColor);
    if (options.showAuthorImage !== undefined)
        params.append("showAuthorImage", options.showAuthorImage ? "1" : "0");
    if (options.showLikeCount !== undefined)
        params.append("showLikeCount", options.showLikeCount ? "1" : "0");
    if (options.cardRadius !== undefined)
        params.append("cardRadius", options.cardRadius.toString());
    if (options.padding !== undefined)
        params.append("padding", options.padding.toString());
    if (options.dateFormat) params.append("dateFormat", options.dateFormat);
    if (options.fontSize !== undefined)
        params.append("fontSize", options.fontSize.toString());
    if (options.scaleFactor !== undefined)
        params.append("scaleFactor", options.scaleFactor.toString());
    if (options.maxWidth !== undefined)
        params.append("maxWidth", options.maxWidth.toString());

    return `${baseUrl}?${params.toString()}`;
}

// Example usage and test URLs
export const testUrls = {
    // Basic Puppeteer route tests
    puppeteerBasic: (baseUrl: string) =>
        generateTestUrl(
            `${baseUrl}/api/card-comment-puppeteer`,
            sampleCommentData
        ),

    puppeteerLarge: (baseUrl: string) =>
        generateTestUrl(
            `${baseUrl}/api/card-comment-puppeteer`,
            longCommentData,
            { size: "large", backgroundColor: "#1a1a1a", textColor: "#ffffff" }
        ),

    // Advanced Puppeteer route tests
    puppeteerAdvancedBasic: (baseUrl: string) =>
        generateTestUrl(
            `${baseUrl}/api/card-comment-puppeteer-advanced`,
            sampleCommentData
        ),

    puppeteerAdvancedCustom: (baseUrl: string) =>
        generateTestUrl(
            `${baseUrl}/api/card-comment-puppeteer-advanced`,
            longCommentData,
            {
                size: "xlarge",
                backgroundColor: "#2563eb",
                textColor: "#ffffff",
                fontSize: 18,
                scaleFactor: 3,
                cardRadius: 16,
                padding: 32,
            }
        ),

    puppeteerAdvancedMinimal: (baseUrl: string) =>
        generateTestUrl(
            `${baseUrl}/api/card-comment-puppeteer-advanced`,
            sampleCommentData,
            {
                size: "small",
                showAuthorImage: false,
                showLikeCount: false,
                backgroundColor: "#f8fafc",
                textColor: "#1e293b",
                fontSize: 14,
                padding: 16,
            }
        ),
};

// Console log helper for testing
export function logTestUrls(baseUrl: string = "http://localhost:3000") {
    console.log("🎨 Puppeteer API Test URLs:");
    console.log("");

    Object.entries(testUrls).forEach(([key, urlGenerator]) => {
        console.log(`${key}:`);
        console.log(urlGenerator(baseUrl));
        console.log("");
    });
}
