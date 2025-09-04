"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function getPublicEnv(key, fallback = "") {
  try {
    if (typeof process !== "undefined" && process.env && typeof process.env[key] !== "undefined") {
      return process.env[key];
    }
  } catch {}
  if (typeof window !== "undefined" && window.__ENV__ && typeof window.__ENV__[key] !== "undefined") {
    return window.__ENV__[key];
  }
  return fallback;
}

function Toast({ open, type, title, desc, onClose }) {
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

// ---- Headless CMS (Sanity) integration (optional) ----
// 1) Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET (public dataset recommended for read-only)
// 2) The component will fetch posts at runtime and replace the local mock.
async function fetchSanityPosts() {
  const projectId = getPublicEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
  const dataset = getPublicEnv("NEXT_PUBLIC_SANITY_DATASET", "");
  if (!projectId || !dataset) return null; // CMS not configured

  const endpoint = `https://${projectId}.api.sanity.io/v2023-10-01/data/query/${dataset}`;
  const groq = encodeURIComponent(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...6]{
    title,
    "excerpt": coalesce(pt::text(body)[0..180], description),
    slug,
    mainImage{asset->{url}},
  }`);

  const res = await fetch(`${endpoint}?query=${groq}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const json = await res.json();
  const items = json?.result || [];
  return items.map((p) => ({
    title: p.title || "Untitled",
    excerpt: (p.excerpt || "").trim(),
    link: `/blog/${p?.slug?.current ?? "post"}`,
    image: p?.mainImage?.asset?.url || "https://placehold.co/600x400/e2e8f0/0f172a?text=The+Plan",
  }));
}
// ------------------------------------------------------

export default function CohortAiLanding() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", msg: "" });
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", title: "", desc: "" });
  const timeoutRef = useRef(null);

  // Default mocked posts (used if CMS not configured)
  const defaultPosts = [
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
  const [posts, setPosts] = useState(defaultPosts);

  const MC_FORM_ACTION = getPublicEnv("NEXT_PUBLIC_MC_FORM_ACTION", "");
  const MC_HONEYPOT = getPublicEnv("NEXT_PUBLIC_MC_HONEYPOT", "b_xxx_xxx");
  const MC_TAGS = getPublicEnv("NEXT_PUBLIC_MC_TAGS", "The Plan,Early Access");
  const mcReady = !!MC_FORM_ACTION;

  const handleMailchimpSubmit = (e) => {
    if (!mcReady) {
      e.preventDefault();
      return;
    }
    setStatus({ type: "loading", msg: "" });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus({ type: "error", msg: "We couldn't reach the mailing list. Please try again." });
      setToast({ open: true, type: "error", title: "Subscription failed", desc: "Network hiccup or provider error. Try again in a moment." });
    }, 12000);
  };

  // Shrink header on scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch CMS posts (if configured). Falls back to defaultPosts on error/unset.
  useEffect(() => {
    let mounted = true;
    fetchSanityPosts()
      .then((items) => {
        if (mounted && items && items.length) {
          setPosts(items);
          console.info("[CohortAI] CMS posts loaded:", items.length);
        } else {
          console.info("[CohortAI] CMS not configured or no posts; using defaults");
        }
      })
      .catch((err) => console.warn("[CohortAI] CMS fetch failed:", err?.message || err));
    return () => (mounted = false);
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.open]);

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-[#25c19b]/10 text-slate-900 font-sans">
      {/* Sticky top nav with shrink on scroll */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled ? "h-14 bg-white/95 shadow-md" : "h-20 bg-white/70"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 py-1">
            <img
              src="https://cohortai.co/wp-content/uploads/2025/09/ask-hAI-1.png"
              alt="Cohort AI"
              className={`object-contain transition-all duration-300 ${scrolled ? "h-8" : "h-10"}`}
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
              We're not quite ready yet
            </h1>
            <p className="mt-4 text-slate-700 text-lg max-w-2xl mx-auto">
              Cohort AI will help schools make better decisions with data — from proactive workforce planning to understanding how absence impacts student outcomes.
            </p>
            <p className="mt-6 text-lg font-semibold text-[#25c19b]">
              Whilst you're waiting, enjoy our new AI in education blog & newsletter called <span className="text-sky-600">The Plan</span>.
            </p>
          </motion.div>

          <iframe
            title="mc-target"
            name="mc-target"
            style={{ display: "none" }}
            onLoad={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setStatus((prev) => {
                if (prev.type === "loading") {
                  setToast({ open: true, type: "success", title: "You're on the list!", desc: "Check your email to confirm your subscription." });
                  return { type: "success", msg: "You're on the list. Check your email to confirm." };
                }
                return prev;
              });
            }}
          />

          <form
            action={mcReady ? MC_FORM_ACTION : undefined}
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={!mcReady}
              title={!mcReady ? "Mailing list not configured yet" : undefined}
            />
            <input type="text" name={MC_HONEYPOT} tabIndex={-1} autoComplete="off" className="hidden" />
            <input type="hidden" name="tags" value={MC_TAGS} />
            {MC_TAGS.split(",").map((t, i) => (
              <input key={i} type="hidden" name="tags[]" value={t.trim()} />
            ))}
            <Button
              type="submit"
              className="h-11 rounded-xl bg-[#25c19b] hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500"
              disabled={status.type === "loading" || !mcReady}
            >
              {status.type === "loading" ? "Joining…" : "Join waitlist"}
            </Button>
          </form>
          {status.type === "success" && <p className="mt-3 text-sm text-[#25c19b]">{status.msg}</p>}
          {!mcReady && <p className="mt-3 text-sm text-slate-500">Mailing list coming soon — the button is disabled until it’s configured.</p>}
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
                className="rounded-2xl border bg-white hover:shadow-lg transition overflow-hidden"
              >
                <div className="relative h-40 w-full">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
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
              <img src="https://cohortai.co/wp-content/uploads/2025/09/ask-hAI-1.png" alt="Cohort AI" className="h-10 w-auto object-contain" />
            </div>
            <p className="mt-3 text-slate-700 font-medium">Make better decisions with data. Workforce planning for schools.</p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#25c19b]">Explore</div>
            <ul className="space-y-2 text-slate-700">
              <li><a href="#about" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">About</a></li>
              <li><a href="#blog" className="hover:bg-gradient-to-r hover:from-sky-500 hover:to-[#25c19b] hover:bg-clip-text hover:text-transparent">The Plan Blog</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#25c19b]">Legal</div>
            <ul className="space-y-2 text-slate-700">
              <li><a href="#" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">Privacy</a></li>
              <li><a href="#" className="hover:bg-gradient-to-r hover:from-[#25c19b] hover:to-sky-500 hover:bg-clip-text hover:text-transparent">Terms</a></li>
              <li className="flex items-center gap-2 text-slate-500"><ShieldCheck className="h-4 w-4" /> Built for trust</li>
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
