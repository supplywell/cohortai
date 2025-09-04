// components/ShareButton.tsx
"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type Props = {
  title: string;
  url?: string;        // optional: override URL if needed
  className?: string;  // optional: extra classes
};

export default function ShareButton({ title, url, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const href = url || window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url: href });
        return;
      }
    } catch {
      // user cancelled; fall through to copy
    }

    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Copy failed — please copy the URL from your browser.");
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      aria-label="Share post"
      className={[
        // Default: Cohort green pill button
        "inline-flex items-center gap-2 text-sm rounded-xl px-3 py-1.5",
        "bg-[#25c19b] text-white hover:opacity-90 border border-[#25c19b]/60",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25c19b]/50",
        className || "",
      ].join(" ")}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
