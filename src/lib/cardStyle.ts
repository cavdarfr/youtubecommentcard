import { CSSProperties } from "react";

// Shared card style for both frontend and backend
export const sharedCardStyle = ({
    backgroundColor = "#fff",
    textColor = "#000",
    fontFamily = "system-ui, Arial, sans-serif",
    fontWeight = "bold",
    fontSize = 16,
    padding = 20,
    borderRadius = 24,
    width = 400,
    height,
    verticalAlign = "center",
}: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    padding?: number;
    borderRadius?: number;
    width?: number;
    height?: number;
    verticalAlign?: "start" | "center" | "end";
} = {}): CSSProperties => {
    const style: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        color: textColor,
        fontFamily,
        fontWeight,
        fontSize,
        lineHeight: 1.5,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        width: `${width}px`,
    };

    if (height !== undefined) {
        style.height = `${height}px`;
        // Apply vertical alignment only when height is specified
        switch (verticalAlign) {
            case "start":
                style.justifyContent = "flex-start";
                break;
            case "center":
                style.justifyContent = "center";
                break;
            case "end":
                style.justifyContent = "flex-end";
                break;
        }
    }

    return style;
};

export const calculateContentHeight = (
    text: string,
    options: {
        fontSize: number;
        padding: number;
        showAuthorImage: boolean;
        showLikeCount: boolean;
        lineHeight?: number;
    }
): number => {
    const {
        fontSize,
        padding,
        showAuthorImage,
        showLikeCount,
        lineHeight = 1.5,
    } = options;

    // Calculate text height
    const textLines = text.split("\n").length;
    const textHeight = textLines * fontSize * lineHeight;

    // Calculate header height (author info)
    const headerHeight = showAuthorImage ? 52 : 40; // 52px with image, 40px without

    // Calculate footer height (like count)
    const footerHeight = showLikeCount ? 32 : 0;

    // Total height = text height + header + footer + padding
    return Math.ceil(textHeight + headerHeight + footerHeight + padding * 2);
};
