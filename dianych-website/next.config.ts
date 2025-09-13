import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb', // Increase the limit to 4MB
        },
    },
};

export default nextConfig;
