import fs from 'fs';
import path from 'path';
import os from 'os';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { enforceCacheLimit } from '@/lib/diskCache';
import { isGalleryId } from '@/lib/galleryIds';
import { clientIp, isRateLimited } from '@/lib/rateLimit';

// Simple in-memory cache for individual images
// key: `${galleryId}|${name}|w${width}|v${version}`
const imageMemoryCache = new Map<string, { updatedAt: number; payload: { galleryId: string; name: string; width: number; version: number; dataUrl: string } }>();

const VERSION = 1;

const WIDTH_BREAKPOINTS = [256, 384, 512, 640, 828, 1080, 1200, 1600, 2000];

function clampWidth(w: number) {
  return WIDTH_BREAKPOINTS.find(bp => bp >= w) ?? WIDTH_BREAKPOINTS[WIDTH_BREAKPOINTS.length - 1];
}

function buildImageKey(galleryId: string, name: string, width: number, version: number) {
  return `${galleryId}|${name}|w${width}|v${version}`;
}

function getDiskDir() {
  // Use OS temp dir to persist between requests (similar approach as gallery-pack)
  const dir = path.join(os.tmpdir(), 'gallery-single-images');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeFileComponent(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getDiskPath(galleryId: string, name: string, width: number, version: number) {
  const dir = getDiskDir();
  const base = `${sanitizeFileComponent(galleryId)}__${sanitizeFileComponent(name)}__w${width}__v${version}.json`;
  return path.join(dir, base);
}

async function generateImage(galleryId: string, name: string, width: number, version: number) {
  const imagesDirectory = path.join(process.cwd(), 'public', 'images', galleryId);
  const fullPath = path.join(imagesDirectory, name);
  if (!fs.existsSync(fullPath)) {
    throw new Error('Image not found');
  }
  const input = fs.readFileSync(fullPath);
  const buf = await sharp(input).rotate().resize({ width }).webp({ quality: 82 }).toBuffer();
  const dataUrl = `data:image/webp;base64,${buf.toString('base64')}`;
  return { galleryId, name, width, version, dataUrl };
}

export const runtime = 'nodejs';

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const galleryId = url.searchParams.get('galleryId');
    const name = url.searchParams.get('name');
    const widthParam = url.searchParams.get('width');

    if (!galleryId || !name) {
      return NextResponse.json({ error: 'galleryId and name are required' }, { status: 400 });
    }

    if (!isGalleryId(galleryId) || !SAFE_FILENAME.test(name)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    let width = Number.parseInt(widthParam || '', 10);
    if (!Number.isFinite(width)) width = 1600;
    width = clampWidth(width);

    const cacheKey = buildImageKey(galleryId, name, width, VERSION);

    // 1) Memory cache
    const mem = imageMemoryCache.get(cacheKey);
    if (mem) {
      return NextResponse.json(mem.payload, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
    }

    // 2) Disk cache
    const diskPath = getDiskPath(galleryId, name, width, VERSION);
    if (fs.existsSync(diskPath)) {
      try {
        const file = fs.readFileSync(diskPath, 'utf-8');
        const payload = JSON.parse(file);
        imageMemoryCache.set(cacheKey, { updatedAt: Date.now(), payload });
        return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
      } catch {
        try { fs.unlinkSync(diskPath); } catch {}
      }
    }

    if (isRateLimited(`image:${clientIp(req)}`, 180, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const payload = await generateImage(galleryId, name, width, VERSION);

    try {
      const json = JSON.stringify(payload);
      fs.writeFileSync(diskPath, json);
      enforceCacheLimit(getDiskDir());
    } catch (error) {
      console.error('image cache write', error);
    }

    imageMemoryCache.set(cacheKey, { updatedAt: Date.now(), payload });

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
  } catch (error) {
    console.error('image GET', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
