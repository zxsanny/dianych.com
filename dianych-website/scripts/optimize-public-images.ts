import { readdir } from 'fs/promises';
import path from 'path';
import { optimizeImageFile } from '../lib/optimizeImage';

const ROOTS = [
    path.join(process.cwd(), 'public', 'images'),
    path.join(process.cwd(), 'public', 'static-images'),
];

async function walk(dir: string, acc: string[]): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walk(full, acc);
        } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
            acc.push(full);
        }
    }
}

async function main() {
    const files: string[] = [];
    for (const root of ROOTS) {
        await walk(root, files);
    }
    let beforeTotal = 0;
    let afterTotal = 0;
    for (const file of files) {
        const result = await optimizeImageFile(file);
        beforeTotal += result.before;
        afterTotal += result.after;
        const rel = path.relative(process.cwd(), file);
        const kb = (n: number) => `${(n / 1024).toFixed(0)}K`;
        console.log(`${result.wrote ? 'W' : '-'} ${kb(result.before).padStart(7)} -> ${kb(result.after).padStart(6)}  ${rel}`);
    }
    console.log(`total ${(beforeTotal / 1e6).toFixed(1)}MB -> ${(afterTotal / 1e6).toFixed(1)}MB`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
