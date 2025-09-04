import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { CalendarDays, ArrowLeft } from "lucide-react";
import ShareButton from "@/components/ShareButton";

// Revalidate pages every 60s (ISR)
export const revalidate = 60;

type Author = {
  name?: string;
  image?: string;
  bio?: string;
};

type Post = {
  title: string;
  excerpt?: string;
  slug: string;
  coverImage?: string;
  body?: any[];
  publishedAt?: string;
  author?: Author;
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 text-2xl font-extrabold tracking-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-xl font-bold">{children}</h3>,
    normal: ({ children }) => <p className="leading-7 text-slate-700">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#25c19b] pl-4 italic text-slate-700">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside space-y-2">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a href={value?.href} className="text-sky-700 hover:underline" target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{children}</code>
    ),
  },
};

// --- Data fetch ---
async function getPost(slug: string): Promise<Post | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;

  const endpoint = `https://${projectId}.api.sanity.io/v2023-10-01/data/query/${dataset}`;
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    excerpt,
    "slug": slug.current,
    "coverImage": mainImage.asset->url,
    body,
    publishedAt,
    author->{
      name,
      "image": image.asset->url,
      bio
    }
  }`;

  const params = new URLSearchParams();
  params.set("query", query);
  params.set("$slug", JSON.stringify(slug));

  try {
    const res = await fetch(`${endpoint}?${params.toString()}`, { next: { revalidate } });
    if (!res.ok) {
      console.error("[CohortAI] Sanity status", res.status, await res.text());
      return null;
    }
    const { result } = (await res.json()) as { result?: Post };
    return result ?? null;
  } catch (err) {
    console.error("[CohortAI] Sanity fetch error:", err);
    return null;
  }
}

// --- Utils ---
function readingTime(body?: any[]): string {
  if (!body) return "3 min read";
  const words = JSON.stringify(body).split(/\s+/).length;
  const minutes = Math.max(2, Math.round(words / 200));
  return `${minutes} min read`;
}

function fmtDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/London",
    });
  } catch {
    return null;
  }
}

// --- Comments (simple starter, Giscus-ready) ---
function Comments() {
  const giscusRepo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const giscusRepoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const giscusCat = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const giscusCatId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (giscusRepo && giscusRepoId && giscusCat && giscusCatId) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        <p>
          Comments powered by <span className="font-semibold">Giscus</span> will appear here in
          production. (We’ve detected config vars — wire in the Giscus component when ready.)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-sm text-slate-600">
      Comments are coming soon. Want early access? <a href="/#top" className="text-sky-700 hover:underline">Join the waitlist</a>.
    </div>
  );
}

// --- Page ---
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = fmtDate(post.publishedAt);
  const rtime = readingTime(post.body);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-[#25c19b]/10">
      {/* Top nav */}
      <div className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <span aria-hidden className="text-slate-400">/</span>
            <Link href="/#blog" className="text-slate-700 hover:text-slate-900">The Plan</Link>
          </div>

          {/* Share button lives on the right */}
          <ShareButton title={post.title} />
        </div>
      </div>

      

      {/* Article */}
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">

        <div className="rounded-3xl border bg-white p-6 sm:p-10 shadow-sm">{post.coverImage && (
  <div className="relative w-full aspect-[16/9] mb-6">
    <Image
      src={post.coverImage}
      alt={post.title}
      fill
      sizes="(max-width: 768px) 100vw, 768px"
      className="object-cover rounded-2xl border"
      priority
    />
  </div>
)}

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{post.title}</h1>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-[#25c19b]" /> {date}
              </span>
            )}
            <span>•</span>
            <span>{rtime}</span>
            {post.author?.name && (
              <>
                <span>•</span>
                <span>By {post.author?.name || "Cohort AI Team"}</span>
              </>
            )}
          </div>

          {/* Author */}
          {post.author?.name && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[#25c19b]/20" />
              )}
              <div className="text-sm">
                <div className="font-semibold text-slate-900">{post.author.name}</div>
                {post.author.bio ? (
                  <div className="text-slate-600">{post.author.bio}</div>
                ) : (
                  <div className="text-slate-500">Contributor, The Plan</div>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="prose prose-slate max-w-none mt-8">
            <PortableText value={post.body ?? []} components={components} />
          </div>

          {/* Divider */}
          <hr className="my-10 border-slate-200" />

          {/* Comments */}
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          <Comments />
        </div>
      </article>
    </main>
  );
}
