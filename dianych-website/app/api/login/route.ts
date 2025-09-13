import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(request.cookies as never, sessionOptions);
    const formData = await request.formData();
    const password = formData.get('password') as string;

    if (!password) {
        return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    try {
        const pwFilePath = path.join(process.cwd(), 'pw.txt');
        const hashedPassword = await fs.readFile(pwFilePath, 'utf-8');

        const isMatch = await bcrypt.compare(password, hashedPassword.trim());

        if (isMatch) {
            session.isLoggedIn = true;
            await session.save();
            return NextResponse.json({ message: 'Success' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}