import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './session';

export async function middleware(request: NextRequest) {
    // Check if the request is for the /manage route
    if (request.nextUrl.pathname.startsWith('/manage')) {
        const session = await getIronSession<SessionData>(request.cookies as never, sessionOptions);

        // If the user is not logged in, redirect them to the login page
        if (!session.isLoggedIn) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Allow the request to proceed if the user is logged in or the route is not protected
    return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
    matcher: '/manage/:path*',
};