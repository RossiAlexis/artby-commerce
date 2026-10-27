import type { NextConfig } from "next";
import { materializeSharpLibvips } from "./scripts/materialize-sharp-libvips";

materializeSharpLibvips();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // sharp's .node dlopens libvips from the sibling package on its RPATH
  // ($ORIGIN/../../sharp-libvips-linux-x64/lib). materializeSharpLibvips()
  // makes that sibling a real directory; this include puts it in the trace.
  outputFileTracingIncludes: {
    "/admin/site-settings": [
      "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/lib/**/*",
    ],
  },
  images: {
    remotePatterns: [
      new URL(
        "https://images.unsplash.com/**?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ),
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
