"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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

export default function CohortAiLanding() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; msg: string }>({ type: "idle", msg: "" });
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [toast, setToast] = useState<{ open: boolean; type: ToastKind; title: string; desc?: string }>({ open: false, type: "info", title: "", desc: "" });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultPosts: BlogCard[] = [
    {
      title: "AI in Education: From Buzzword to Classroom Impact",
      excerpt:
        "How artificial intelligence is moving beyond hype and starting to shape real decisions in schools, from workload planning to personalised support.",
      link: "/blog/ai-in-education-impact",
      image: "https://placehold.co/600x400/bae6fd/082f49?text=AI+Classroom",
    },
    {
      title: "Predicting Staff Absence with Data",
      excerpt:
        "Discover how machine learning can help schools anticipate absence patterns, reduce disruption, and keep teaching and learning on track.",
      link: "/blog/predicting-staff-absence",
      image: "https://placehold.co/600x400/bef264/1a2e05?text=Staff+Absence",
    },
    {
      title: "Benchmarking Your School Against ‘Schools Like Yours’",
      excerpt:
        "Why comparative data matters: using AI-driven benchmarks to give school leaders clarity and confidence in decision-making.",
      link: "/blog/benchmarking-schools",
      image: "https://placehold.co/600x400/fde68a/78350f?text=Benchmarking",
    },
  ];
  const [posts] = useState<BlogCard[]>(defaultPosts);

  // --- Hard-coded Mailchimp details ---
  const MC_FORM_ACTION = "https://supplywell.us7.list-manage.com/subscribe/post?u=5da5b96e4a91f91291ec14ad8&id=80b09b98a9&f_id=0091c2e1f0";
  const MC_HONEYPOT = "b_5da5b96e4a91f91291ec14ad8_80b09b98a9";
  const MC_TAGS = "Cohort-ThePlan,Cohort-Pilot";

  // Updated function signature: removed event parameter
  const handleMailchimpSubmit = (): void => {
    setStatus({ type: "loading", msg: "" });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus({ type: "error", msg: "We couldn't reach the mailing list. Please try again." });
      setToast({ open: true, type: "error", title: "Subscription failed", desc: "Network hiccup or provider error. Try again in a moment." });
    }, 12000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.open]);

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-[#25c19b]/10 text-slate-900 font-sans">
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${scrolled ? "h-14 bg-white/95 shadow-md" : "h-20 bg-white/70"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 py-1">
            <Image
              src="https://cohortai.co/wp-content/uploads/2025/09/ask-hAI-1.png"
              alt="Cohort AI"
              width={200}
              height={40}
              priority
              sizes="(max-width: 768px) 120px, 200px"
              className={`object-contain transition-all duration-300 ${scrolled ? "h-8" : "h-10"} w-auto`}
            />
            <Badge variant="secondary" className="hidden sm:inline-flex bg-[#25c19b]/20 text-[#25c19b]">Coming Soon</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-base font-medium self-center">
            <a href="#about" className="transition-colors hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">About</a>
            <a href="#blog" className="transition-colors hover:bg-gradient-to-r hover:from-sky-500 hover:to-[#25c19b] hover:bg-clip-text hover:text-transparent">The Plan Blog</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 inline-flex items-center gap-1 bg-[#25c19b]/20 text-[#25c19b]" variant="secondary">
              <Sparkles className="h-3.5 w-3.5 text-[#25c19b]" /> Make better decisions with data
            </Badge>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] bg-gradient-to-r from-[#25c19b] via-sky-500 to-[#25c19b] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_6s_linear_infinite]">
              We’re not quite ready yet
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl mx-auto">
              Cohort AI will help schools make better decisions with data — from proactive workforce planning to understanding how absence impacts student outcomes.
            </p>
            <p className="mt-6 text-lg font-semibold text-[#25c19b]">
              Whilst you’re waiting, enjoy our new AI in education blog & newsletter called <span className="text-sky-600">The Plan</span>.
            </p>
          </motion.div>

          {/* Hidden iframe target for Mailchimp POST */}
          <iframe
            title="mc-target"
            name="mc-target"
            style={{ display: "none" }}
            onLoad={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setStatus((prev) => {
                if (prev.type === "loading") {
                  // Toast for immediate feedback
                  setToast({ open: true, type: "success", title: "Please confirm your email", desc: "We’ve sent you a confirmation link. Click it to complete your subscription." });
                  // Soft navigate to thank-you page so users don't sit on the hero
                  router.push("/thanks");
                  return { type: "success", msg: "Check your inbox for a confirmation email to complete sign‑up." };
                }
                return prev;
              });
            }}
          />

          <form
            action={MC_FORM_ACTION}
            method="post"
            target="mc-target"
            onSubmit={handleMailchimpSubmit}
            className="mt-8 flex w-full max-w-md gap-2 mx-auto"
            noValidate
          >
            <Input
              placeholder="Your work email"
              type="email"
              name="EMAIL"
              required
              className="h-11 rounded-xl border-[#25c19b]/40 focus:border-[#25c19b] focus:ring-[#25c19b]/40"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <input type="text" name={MC_HONEYPOT} tabIndex={-1} autoComplete="off" className="hidden" />
            <input type="hidden" name="tags" value={MC_TAGS} />
            {MC_TAGS.split(",").map((t: string, i: number) => (
              <input key={i} type="hidden" name="tags[]" value={t.trim()} />
            ))}
            <Button
              type="submit"
              className="h-11 rounded-xl bg-[#25c19b] hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500"
              disabled={status.type === "loading"}
            >
              {status.type === "loading" ? "Joining…" : "Join waitlist"}
            </Button>
          </form>
          {status.type === "success" && <p className="mt-3 text-sm text-[#25c19b]">{status.msg}</p>}
          {status.type === "error" && <p className="mt-3 text-sm text-red-600">{status.msg}</p>}
        </div>
      </section>

      {/* Blog teaser */}
      <section id="blog" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#25c19b]/5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-sky-900">Latest from The Plan</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post.title}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl border bg-white hover:shadow-lg transition overflow-hidden relative h-full"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-[#25c19b]">{post.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">{post.excerpt}</p>
                  <a
                    href={post.link}
                    className="text-sky-600 hover:bg-gradient-to-r hover:from-sky-500 hover:to-[#25c19b] hover:bg-clip-text hover:text-transparent text-sm font-medium"
                  >
                    Read more
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-4 py-1">
              <Image src="https://cohortai.co/wp-content/uploads/2025/09/ask-hAI-1.png" alt="Cohort AI" width={200} height={40} sizes="(max-width: 768px) 120px, 200px" className="h-10 w-auto object-contain" />
            </div>
            <p className="mt-3 text-slate-700 font-medium">Make better decisions with data. Workforce planning for schools.</p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#25c19b]">Explore</div>
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="#about" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">About</a>
              </li>
              <li>
                <a href="#blog" className="hover:bg-gradient-to-r hover:from-sky-500 hover:to-[#25c19b] hover:bg-clip-text hover:text-transparent">The Plan Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#25c19b]">Legal</div>
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="/privacy" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">Privacy</a>
              </li>
              <li>
                <a href="/terms" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">Terms</a>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4" /> Built for trust
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Cohort AI. All rights reserved.</div>
      </footer>

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        desc={toast.desc}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
