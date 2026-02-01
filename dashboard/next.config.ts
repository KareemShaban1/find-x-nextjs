import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When served under a subpath (e.g. findx.kareemsoft.org/dashboard), set basePath.
  // For root deployment (e.g. dashboard.example.com) use basePath: "" or omit.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
