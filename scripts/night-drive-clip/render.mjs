// Renders public/media/night-drive.{webm,mp4}: an original, seamless 8 s loop of the
// night-drive illustration (scene.html), captured frame by frame with Playwright and
// encoded with ffmpeg. Run `npm run media:clip` after editing scene.html.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', '..', 'public', 'media');
const fps = 30;
const seconds = 8;
const frames = mkdtempSync(join(tmpdir(), 'night-drive-'));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.setContent(readFileSync(join(here, 'scene.html'), 'utf8'));
for (let index = 0; index < fps * seconds; index++) {
  await page.evaluate((time) => window.render(time), index / fps);
  await page.screenshot({ path: join(frames, `f_${String(index).padStart(3, '0')}.png`) });
}
await browser.close();

const input = ['-y', '-framerate', String(fps), '-i', join(frames, 'f_%03d.png'), '-an'];
execFileSync(
  'ffmpeg',
  [
    ...input,
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '36',
    '-row-mt',
    '1',
    '-pix_fmt',
    'yuv420p',
    join(out, 'night-drive.webm'),
  ],
  { stdio: 'inherit' },
);
execFileSync(
  'ffmpeg',
  [
    ...input,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '27',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    join(out, 'night-drive.mp4'),
  ],
  { stdio: 'inherit' },
);
rmSync(frames, { recursive: true, force: true });
console.log(`Rendered ${fps * seconds} frames into ${out}`);
