import type { MetadataRoute } from "next";


export default function robots(): MetadataRoute.Robots {
return {
rules: [{ userAgent: "*", allow: "/" }],
sitemap: "https://cohortai.co/sitemap.xml",
host: "https://cohortai.co",
};
}