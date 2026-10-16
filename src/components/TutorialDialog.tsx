"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface TutorialDialogProps {
    children: React.ReactNode;
}

export function TutorialDialog({ children }: TutorialDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-blue-800">
                        📚 How to get a YouTube Comment URL
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                1
                            </span>
                            <p>
                                Go to the YouTube video with the comment you
                                want to use
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                2
                            </span>
                            <p>Find the comment in the comments section</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                3
                            </span>
                            <p>
                                On the comment section of a YouTube video, next
                                to the name of the author of the comment, there
                                is a timestamp. Click on it and copy the new URL
                                from the address bar.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                4
                            </span>
                            <p>
                                Copy the URL from your browser&apos;s address
                                bar and paste it below
                            </p>
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>💡 Tip:</strong> The timestamp is usually
                            located next to the author&apos;s name and is
                            clickable. After clicking, the URL will change to
                            include the comment ID.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
