import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb'
        },
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dianych.com',
                port: '',
                pathname: '/images/**',
            },
        ],
    },
};

export default nextConfig;
