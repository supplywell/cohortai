// components/ShareButton.tsx
"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } else {
        // Fallback: copy URL
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch {
      // user cancelled or share not supported — noop
    }
  };

  return (
    <button
      onClick={handleShare}
      className="hidden sm:inline-flex items-center gap-2 text-sm rounded-xl px-3 py-1.5 border hover:bg-white"
      aria-label="Share post"
      type="button"
    >
      <Share2 className="h-4 w-4" /> Share
    </button>
  );
}
