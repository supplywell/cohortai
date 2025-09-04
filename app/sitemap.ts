import type { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
const base = "https://cohortai.co";
return [
{ url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
{ url: `${base}/thanks`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
];
}