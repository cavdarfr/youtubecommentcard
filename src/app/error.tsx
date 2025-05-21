"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    console.error(error);
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
            <p className="mb-4 text-gray-600">
                We apologize for the inconvenience.
            </p>
            <button
                onClick={() => reset()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
