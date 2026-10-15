import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "portfolioapi.pythonanywhere.com", pathname: "/media/**" },
    ],
  },
};
export default nextConfig;
