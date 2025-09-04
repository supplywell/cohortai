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
  ],
},

};

export default nextConfig;
