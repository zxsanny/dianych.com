import { NextRequest } from 'next/server';

export function clientIp(request: NextRequest): string {
    const real = request.headers.get('x-real-ip')?.trim();
    if (real) return real;
    const xff = request.headers.get('x-forwarded-for');
    if (xff) {
        const hops = xff.split(',').map((s) => s.trim()).filter(Boolean);
        if (hops.length) return hops[hops.length - 1];
    }
    return 'unknown';
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = buckets.get(key);
    if (!entry || now > entry.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }
    entry.count++;
    return entry.count > max;
}
