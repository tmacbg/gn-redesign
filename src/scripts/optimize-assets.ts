/**
 * Converts Higgsfield PNG masters (assets-src/higgsfield) into responsive AVIF + WebP
 * variants and writes manifest.json. Run: docker compose run --rm app npm run assets:optimize
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = 'public/assets/higgsfield';
const SRC = 'assets-src/higgsfield';
const widthsFor = (name: string) =>
  name === 'hero-desktop' ? [1280, 1920, 2560]
  : name === 'hero-tablet' ? [1024, 1600]
  : name === 'hero-mobile' ? [640, 1080]
  : name.startsWith('campaign-') ? [960, 1600, 2400]
  : [480, 800];

async function main() {
  const jobs = (await fs.readFile(path.join(SRC, 'jobs.tsv'), 'utf8')).trim().split('\n').map((l) => l.split('\t'));
  const assets = [];
  for (const [name, jobId] of jobs) {
    const input = path.join(SRC, `${name}.png`);
    const meta = await sharp(input).metadata();
    const variants = [];
    for (const w of widthsFor(name!)) {
      if (meta.width && w > meta.width) continue;
      for (const fmt of ['avif', 'webp'] as const) {
        const file = `${name}-${w}.${fmt}`;
        const img = sharp(input).resize({ width: w });
        const out = fmt === 'avif' ? img.avif({ quality: 55, effort: 5 }) : img.webp({ quality: 78 });
        const info = await out.toFile(path.join(DIR, file));
        variants.push({ file, width: w, height: info.height, format: fmt, bytes: info.size });
      }
    }
    assets.push({ name, higgsfieldJobId: jobId, master: `assets-src/higgsfield/${name}.png`, masterSize: [meta.width, meta.height], variants });
    console.log(name, variants.map((v) => `${v.file} ${(v.bytes / 1024).toFixed(0)}KB`).join(', '));
  }
  await fs.writeFile(path.join(DIR, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), assets }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
