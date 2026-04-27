import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Picsum (mock thumbnails)
      { protocol: "https", hostname: "picsum.photos" },
      // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Pinterest CDN
      { protocol: "https", hostname: "i.pinimg.com" },
      // NewsData images (vary by outlet — allow all https)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
