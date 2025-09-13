import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface SessionData {
    isLoggedIn?: boolean;
}

const rawSecret = (process.env.SECRET_COOKIE_PASSWORD || '') as string;
// If the provided secret is shorter than iron-session's 32-char minimum,
// expand it as `{pass}.{pass}.{pass}` to meet the required length.
const expandedSecret = rawSecret.length >= 32 ? rawSecret : `${rawSecret}.${rawSecret}.${rawSecret}`;

export const sessionOptions: SessionOptions = {
    password: expandedSecret,
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