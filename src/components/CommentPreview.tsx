import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommentPreviewProps {
    previewUrl: string;
    imageSize: { width: number; height: number } | null;
    onImageLoad: (size: { width: number; height: number }) => void;
    onDownload: () => void;
}

export function CommentPreview({
    previewUrl,
    imageSize,
    onImageLoad,
    onDownload,
}: CommentPreviewProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        setImageLoading(false);
        onImageLoad({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
    };

    const handleImageError = () => {
        console.error("Image failed to load:", previewUrl);
        setImageError(true);
        setImageLoading(false);
    };

    return (
        <>
            <div className="text-center mb-4">
                <div className="text-lg font-medium mb-1">Preview</div>
                <div className="text-xs text-gray-500">
                    Dynamic height • High-DPI rendering
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-lg flex justify-center">
                    <div className="relative">
                        {imageLoading && (
                            <div className="flex items-center justify-center bg-white rounded-lg shadow-lg p-8 min-w-[300px] min-h-[200px]">
                                <div className="text-gray-400 text-center">
                                    <div className="animate-pulse text-2xl mb-2">
                                        🎬
                                    </div>
                                    <div className="text-sm">
                                        Generating with Puppeteer...
                                    </div>
                                </div>
                            </div>
                        )}

                        {imageError && (
                            <div className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg shadow-lg p-8 min-w-[300px] min-h-[200px]">
                                <div className="text-red-600 text-center">
                                    <div className="text-2xl mb-2">❌</div>
                                    <div className="text-sm">
                                        Failed to generate image
                                    </div>
                                    <div className="text-xs mt-1 text-red-500">
                                        Check console for details
                                    </div>
                                </div>
                            </div>
                        )}

                        <img
                            src={previewUrl}
                            alt="Comment Card Preview"
                            className={`max-w-full h-auto rounded-lg shadow-lg ${
                                imageSize && !imageLoading && !imageError
                                    ? "block"
                                    : "absolute opacity-0 pointer-events-none"
                            }`}
                            style={{
                                maxWidth: "100%",
                                width: "auto",
                                height: "auto",
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={onDownload}
                    className="px-6"
                    disabled={!imageSize || imageError}
                >
                    Download Comment Card
                </Button>
            </div>
        </>
    );
}
