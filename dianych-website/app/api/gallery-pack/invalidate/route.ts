import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '../cache';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let galleryId = '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      galleryId = (body?.galleryId || '').toString();
    }

    if (!galleryId) {
      const url = new URL(req.url);
      galleryId = url.searchParams.get('galleryId') || '';
    }

    if (!galleryId) {
      return NextResponse.json({ error: 'galleryId is required' }, { status: 400 });
    }

    await invalidateCache(galleryId, 500, 1);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = (e instanceof Error && e.message) ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
