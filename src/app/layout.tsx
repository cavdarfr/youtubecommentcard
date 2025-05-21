import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "YouTube Comment Card Generator | Cavdar.fr",
    description:
        "Create beautiful YouTube comment cards with customizable styles. Transform your favorite YouTube comments into shareable cards.",
    keywords: [
        "YouTube",
        "comment card",
        "social media",
        "content creation",
        "Cavdar.fr",
    ],
    authors: [{ name: "Cavdar.fr" }],
    metadataBase: new URL("https://youtubecommentcard.vercel.app"),
    openGraph: {
        type: "website",
        url: "https://youtubecommentcard.vercel.app",
        title: "YouTube Comment Card Generator | Cavdar.fr",
        description:
            "Create beautiful YouTube comment cards with customizable styles. Transform your favorite YouTube comments into shareable cards.",
        images: [
            {
                url: "/logo.png",
                width: 1200,
                height: 630,
                alt: "YouTube Comment Card Generator",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "YouTube Comment Card Generator | Cavdar.fr",
        description:
            "Create beautiful YouTube comment cards with customizable styles. Transform your favorite YouTube comments into shareable cards.",
        images: ["/logo.png"],
    },
    icons: {
        icon: [{ url: "/logo.png" }],
        apple: [{ url: "/logo.png" }],
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-gray-50`}
            >
                {children}
            </body>
        </html>
    );
}
