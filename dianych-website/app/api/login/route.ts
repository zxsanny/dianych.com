import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

function expandIfShort(pass: string): string {
    if (!pass) return pass;
    return pass.length >= 32 ? pass : `${pass}.${pass}.${pass}`;
}

export async function POST(request: NextRequest) {
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
            // Redirect to manage so clients using regular form submission will navigate
            const redirectUrl = new URL('/manage', request.url);
            return NextResponse.redirect(redirectUrl);
        } else {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}