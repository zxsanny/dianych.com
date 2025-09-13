import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(request.cookies as never, sessionOptions);
    session.destroy();

    const response = NextResponse.json({ message: 'Logged out' });
    response.cookies.set(sessionOptions.cookieName, '', { maxAge: -1 });

    return response;
}