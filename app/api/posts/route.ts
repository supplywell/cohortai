import { NextResponse } from "next/server";


type SanityPostDoc = {
title?: string;
excerpt?: string;
slug?: { current?: string };
mainImage?: { asset?: { url?: string } };
publishedAt?: string;
};


type BlogCard = {
title: string;
excerpt: string;
link: string;
image: string;
};


export async function GET() {
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!projectId || !dataset) return NextResponse.json([], { status: 200 });


const endpoint = `https://${projectId}.api.sanity.io/v2023-10-01/data/query/${dataset}`;
const groq = encodeURIComponent(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...6]{
title,
excerpt,
slug,
mainImage{asset->{url}}
}`);


const res = await fetch(`${endpoint}?query=${groq}`, { cache: "no-store" });
if (!res.ok) return NextResponse.json([], { status: 200 });
const json = (await res.json()) as { result?: SanityPostDoc[] };
const items = json?.result ?? [];
const mapped: BlogCard[] = items.map((p) => ({
title: p.title || "Untitled",
excerpt: (p.excerpt || "").trim(),
link: `/blog/${p.slug?.current ?? "post"}`,
image: p.mainImage?.asset?.url || "https://placehold.co/600x400/e2e8f0/0f172a?text=The+Plan",
}));
return NextResponse.json(mapped);
}