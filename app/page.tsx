"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";


// -------------------- Types --------------------
type ToastKind = "info" | "success" | "error";


interface ToastProps {
open: boolean;
type: ToastKind;
title: string;
desc?: string;
onClose: () => void;
}


interface BlogCard {
title: string;
excerpt: string;
link: string;
image: string;
}


type ToastState = { open: boolean; type: ToastKind; title: string; desc?: string };


function Toast({ open, type, title, desc, onClose }: ToastProps) {
if (!open) return null;
const color = type === "error" ? "bg-red-600" : type === "success" ? "bg-[#25c19b]" : "bg-sky-600";
return (
<div role="status" aria-live="polite" className="fixed right-4 bottom-4 z-[100] max-w-sm w-[90vw] sm:w-96 shadow-lg rounded-xl overflow-hidden">
<div className={`${color} text-white px-4 py-3 font-semibold`}>{title}</div>
{desc ? <div className="bg-white px-4 py-3 text-sm text-slate-700 border-x border-b border-slate-200">{desc}</div> : null}
<button
onClick={onClose}
className="absolute top-2 right-2 h-6 w-6 inline-flex items-center justify-center rounded hover:bg-white/20 text-white"
aria-label="Close notification"
>
×
</button>
</div>
);

}