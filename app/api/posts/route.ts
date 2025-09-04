// app/api/posts/route.ts
import { NextResponse } from "next/server";

type ApiPost = {
  title: string;
  excerpt?: string;
  slug: string;
  image?: string;
};

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "3");

    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const token = process.env.SANITY_API_READ_TOKEN; // optional

    if (!projectId || !dataset) {
      console.error("[/api/posts] Missing SANITY envs");
      return NextResponse.json([], { status: 200 });
    }

    const endpoint = `https://${projectId}.api.sanity.io/v2023-10-01/data/query/${dataset}`;

    // Only published posts if no token (public read). With token, it can also see drafts via overlayDrafts().
    // For simplicity, restrict to published:
    const groq = `*[_type == "post" && defined(slug.current) && defined(mainImage)] | order(publishedAt desc)[0...$limit]{
      title,
      excerpt,
      "slug": slug.current,
      "image": mainImage.asset->url
    }`;

    const params = new URLSearchParams();
    params.set("query", groq);                 // Sanity accepts raw GROQ here
    params.set("$limit", JSON.stringify(limit));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      headers,
      // revalidate at route level
      next: { revalidate },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[/api/posts] Sanity response not ok", res.status, text);
      return NextResponse.json([], { status: 200 });
    }

    const { result } = (await res.json()) as { result?: ApiPost[] };
    const posts = Array.isArray(result) ? result : [];

    // Shape into your BlogCard model used by the homepage
    const cards = posts.map((p) => ({
      title: p.title,
      excerpt: p.excerpt ?? "",
      link: `/blog/${p.slug}`,
      image: p.image ?? "https://placehold.co/600x400/e2e8f0/0f172a?text=The+Plan"
    }));

    return NextResponse.json(cards);
  } catch (err) {
    console.error("[/api/posts] Error", err);
    return NextResponse.json([], { status: 200 });
  }
}
