import fs from 'fs';
import path from 'path';

const MAX_CACHE_BYTES = 500 * 1024 * 1024; // 500 MB

export function enforceCacheLimit(cacheDir: string) {
  if (!fs.existsSync(cacheDir)) return;

  const files = fs.readdirSync(cacheDir)
    .map(name => {
      const fp = path.join(cacheDir, name);
      try {
        const stat = fs.statSync(fp);
        return { path: fp, mtimeMs: stat.mtimeMs, size: stat.size };
      } catch { return null; }
    })
    .filter(Boolean) as { path: string; mtimeMs: number; size: number }[];

  let totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize <= MAX_CACHE_BYTES) return;

  files.sort((a, b) => a.mtimeMs - b.mtimeMs);

  for (const file of files) {
    if (totalSize <= MAX_CACHE_BYTES) break;
    try {
      fs.unlinkSync(file.path);
      totalSize -= file.size;
    } catch {}
  }
}
