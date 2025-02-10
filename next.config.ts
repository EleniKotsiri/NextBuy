import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // For development only

export default nextConfig;
