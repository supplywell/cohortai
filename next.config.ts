import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cohortai.co",
      pathname: "/wp-content/**",
    },
    {
      protocol: "https",
      hostname: "placehold.co",
      pathname: "/**",
    },
    { protocol: "https", hostname: "cdn.sanity.io" }, 
  ],
},

};

export default nextConfig;
