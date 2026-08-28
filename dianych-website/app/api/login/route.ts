import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { expandIfShort } from '@/lib/expandIfShort';
import { clientIp, isRateLimited } from '@/lib/rateLimit';

function manageRedirect(request: NextRequest): NextResponse {
    const host = request.headers.get('host') || request.nextUrl.host;
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '') || 'https';
    return NextResponse.redirect(`${proto}://${host}/manage`);
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
    const ip = clientIp(request);
    if (isRateLimited(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
        return NextResponse.json({ message: 'Too many login attempts. Try again later.' }, { status: 429 });
    }
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

        const expanded = expandIfShort(password);
        const matchExpanded = await bcrypt.compare(expanded, trimmedHash);
        const matchRaw = expanded !== password ? await bcrypt.compare(password, trimmedHash) : false;
        const isMatch = matchExpanded || matchRaw;

        if (isMatch) {
            session.isLoggedIn = true;
            await session.save();
            return manageRedirect(request);
        }
        console.error('Login failed', ip);
        return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
