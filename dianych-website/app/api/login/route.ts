import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { expandIfShort } from '@/lib/expandIfShort';

function buildAbsoluteUrl(request: NextRequest, pathname: string): string {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    return `${proto}://${host}${pathname}`;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ message: 'Too many login attempts. Try again later.' }, { status: 429 });
    }
    // Use the mutable cookies() store so iron-session can set Set-Cookie headers
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (!password) {
        return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    try {
        const pwFilePath = path.join(process.cwd(), 'pw.txt');
        const hashedPassword = await fs.readFile(pwFilePath, 'utf-8');
        const trimmedHash = hashedPassword.trim();

        // Try to match using expanded strategy, but support legacy hashes too
        const expanded = expandIfShort(password);
        const matchExpanded = await bcrypt.compare(expanded, trimmedHash);
        const matchRaw = expanded !== password ? await bcrypt.compare(password, trimmedHash) : false;
        const isMatch = matchExpanded || matchRaw;

        if (isMatch) {
            session.isLoggedIn = true;
            await session.save();
            // Build an absolute URL using forwarded headers to avoid internal Docker hostnames
            const manageAbsUrl = buildAbsoluteUrl(request, '/manage');
            return NextResponse.redirect(manageAbsUrl);
        } else {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}