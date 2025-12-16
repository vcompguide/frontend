import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack resolves the workspace root where `next` is installed.
  // From `frontend/` the project root is one level up.
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  reactStrictMode: false
};

module.exports = {
  images: {
    remotePatterns: [new URL('https://images.unsplash.com/*')],
  },
}
export default nextConfig;
