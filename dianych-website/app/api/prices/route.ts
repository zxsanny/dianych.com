import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { DEFAULT_FRAME_PRICES, type FramePrices } from '@/lib/defaultFramePrices';

const DATA_FILE = path.join(process.cwd(), 'dianych-website', 'data', 'framePrices.json');

async function readPrices(): Promise<FramePrices> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<FramePrices>;
    // Basic normalization to ensure numbers
    return {
      smallFrame8: Number(parsed.smallFrame8 ?? DEFAULT_FRAME_PRICES.smallFrame8),
      smallFrame10: Number(parsed.smallFrame10 ?? DEFAULT_FRAME_PRICES.smallFrame10),
      mediumFrame14: Number(parsed.mediumFrame14 ?? DEFAULT_FRAME_PRICES.mediumFrame14),
      largeFrame19: Number(parsed.largeFrame19 ?? DEFAULT_FRAME_PRICES.largeFrame19),
    };
  } catch (e: unknown) {
    console.error('Failed to read prices', e);
    const defaults: FramePrices = DEFAULT_FRAME_PRICES;
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    } catch {}
    return defaults;
  }
}

async function writePrices(data: FramePrices) {
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

    function toNumber(v: unknown): number {
      const n = typeof v === 'string' ? v.trim() : v;
      const num = typeof n === 'number' ? n : Number(n);
      return Number.isFinite(num) ? num : NaN;
    }

    const parsed: FramePrices = {
      smallFrame8: toNumber(smallFrame8),
      smallFrame10: toNumber(smallFrame10),
      mediumFrame14: toNumber(mediumFrame14),
      largeFrame19: toNumber(largeFrame19),
    };

    const invalid = Object.values(parsed).filter((v) => !Number.isFinite(v) || v < 0);
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
