import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
metadataBase: new URL("https://cohortai.co"),
title: {
default: "Cohort AI — Make better decisions with data",
template: "%s | Cohort AI",
},
description:
"Workforce planning for schools. Be proactive about staff absence and understand its impact on student outcomes. Benchmark against schools like yours.",
alternates: { canonical: "/" },
openGraph: {
type: "website",
url: "https://cohortai.co/",
title: "Cohort AI — Make better decisions with data",
description:
"Workforce planning for schools. Be proactive about staff absence and understand its impact on student outcomes.",
},
robots: { index: true, follow: true },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body className="min-h-screen bg-white text-slate-900">{children}</body>
</html>
);
}