import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface SessionData {
    isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: 'dianych-manage-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function getSessionFromRequest(req: NextRequest): Promise<IronSession<SessionData>> {
    return getIronSession<SessionData>(req.cookies as never, sessionOptions);
}