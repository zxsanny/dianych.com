import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';

const DATA_FILE = path.join(process.cwd(), 'dianych-website', 'data', 'framePrices.json');

async function readPrices() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e: any) {
    // If file missing, initialize with defaults
    const defaults = {
      smallFrame8: 450,
      smallFrame10: 500,
      mediumFrame14: 600,
      largeFrame19: 700,
    };
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    } catch {}
    return defaults;
  }
}

async function writePrices(data: any) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function GET() {
  const prices = await readPrices();
  return NextResponse.json(prices);
}

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { smallFrame8, smallFrame10, mediumFrame14, largeFrame19 } = body || {};

    function toNumber(v: any) {
      const n = typeof v === 'string' ? v.trim() : v;
      const num = Number(n);
      return Number.isFinite(num) ? num : NaN;
    }

    const parsed = {
      smallFrame8: toNumber(smallFrame8),
      smallFrame10: toNumber(smallFrame10),
      mediumFrame14: toNumber(mediumFrame14),
      largeFrame19: toNumber(largeFrame19),
    } as Record<string, number>;

    const invalid = Object.entries(parsed).filter(([_, v]) => !Number.isFinite(v) || v < 0);
    if (invalid.length) {
      return NextResponse.json({ message: 'All prices must be non-negative numbers.' }, { status: 400 });
    }

    await writePrices(parsed);
    return NextResponse.json(parsed, { status: 200 });
  } catch (e) {
    console.error('Failed to update prices', e);
    return NextResponse.json({ message: 'Failed to update prices' }, { status: 500 });
  }
}
