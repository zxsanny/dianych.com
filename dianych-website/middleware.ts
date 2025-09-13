import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/manage')) {
    const session = await getIronSession<SessionData>(request.cookies as never, sessionOptions);

    if (!session.isLoggedIn) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manage/:path*'],
};
