import type { NextConfig } from "next";
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config({ path: '../.env' });

const cloudflareUrl = process.env.CLOUDFLARE_R2_URL;
const cloudflareHostname = cloudflareUrl ? new URL(cloudflareUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cloudflareHostname
      ? [
          {
            protocol: "https",
            hostname: `*.${cloudflareHostname}`, // Match all subdomains
          },
        ]
      : [],
  },
};

export default nextConfig;
