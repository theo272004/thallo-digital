#!/usr/bin/env node
/**
 * render.mjs — turns index.html into an MP4, one seek per frame.
 *
 * The page exposes window.__seek(t) and nothing on it moves by itself, so a
 * frame is: seek, screenshot, pipe to ffmpeg. Frames are stepped strictly
 * forward from 0 because GSAP records a tween's start values the first time it
 * renders — jumping straight to t=40 would give a different picture.
 *
 *   node video/promo-01/render.mjs                    → out/silent.mp4
 *   node video/promo-01/render.mjs --stills 3,14,31  → out/still-3.png …
 *
 * Audio is muxed afterwards by mix.py (voice + sound bed).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => {
  if (x.startsWith('--')) a.push([x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return a;
}, []));
const FPS = +(args.fps || 30);
const out = path.join(here, 'out');
fs.mkdirSync(out, { recursive: true });

const chrome = args.chrome || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe');
const browser = await puppeteer.launch({
  executablePath: chrome, headless: true,
  args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
await page.goto(pathToFileURL(path.join(here, 'index.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => window.__ready);
const duration = await page.evaluate(() => window.__duration);
const stage = await page.$('#stage');

if (args.stills) {
  const want = String(args.stills).split(',').map(Number).sort((a, b) => a - b);
  let k = 0;
  for (let f = 0; k < want.length; f++) {
    const t = f / FPS;
    await page.evaluate(t => window.__seek(t), t);
    while (k < want.length && t + 1e-6 >= want[k]) {
      await stage.screenshot({ path: path.join(out, `still-${want[k]}.png`) });
      console.log('still', want[k]); k++;
    }
  }
} else {
  const frames = Math.round(duration * FPS);
  const file = path.join(out, args.out || 'silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.__seek(t), f / FPS);
    const buf = await stage.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', file);
}
await browser.close();
