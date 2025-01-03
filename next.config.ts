import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["ryogrryguqcokfoehobg.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ryogrryguqcokfoehobg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
