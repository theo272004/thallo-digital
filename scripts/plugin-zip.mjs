/**
 * Packages `wordpress-plugin/thallo-visibility/` into an installable zip.
 *
 * This exists because of a specific bug that shipped three times. PowerShell's
 * `Compress-Archive` writes entry names with the Windows separator —
 * `thallo-visibility\readme.txt` — and the ZIP spec (APPNOTE 4.4.17.1) requires
 * a forward slash. Windows tooling reads its own output back happily, so the
 * archive looks fine locally; PHP on the Linux host does not, and treats the
 * whole thing as a set of files whose names contain a backslash. WordPress
 * would have installed a flat pile of oddly-named files and reported success.
 *
 * So this writes the archive by hand rather than shelling out. It is a plain
 * stored (uncompressed) zip: no dependency to install, nothing to keep in step
 * with a build tool, and about 180KB — the plugin is text and it travels once.
 *
 *   node scripts/plugin-zip.mjs
 */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Two things to package now — the plugin and the blog theme — and both have
   the same requirement that brought this script into existence: forward
   slashes in the entry names. `npm run theme:zip` passes the theme's path. */
const TARGETS = {
  plugin: { src: ['wordpress-plugin', 'thallo-visibility'], out: ['wordpress-plugin', 'thallo-visibility.zip'] },
  theme: { src: ['wordpress-theme', 'thallo-blog'], out: ['wordpress-theme', 'thallo-blog.zip'] },
};

const name = process.argv[2] ?? 'plugin';
const target = TARGETS[name];
if (!target) {
  console.error(`Unknown target "${name}". Use one of: ${Object.keys(TARGETS).join(', ')}`);
  process.exit(1);
}

const SRC = join(ROOT, ...target.src);
const OUT = join(ROOT, ...target.out);

/** CRC-32, which the zip format requires per entry and Node does not ship. */
const TABLE = Int32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/* Every path is posix-separated on the way in. This is the whole point of the
   file, so it happens once, here, and not at each call site. */
/* The folder WordPress will unpack into, taken from the source directory
   rather than written out. Hardcoding it was fine while there was one target
   and silently wrong the moment there were two: the theme packaged itself
   under the plugin's name, which installs as a theme called thallo-visibility
   and fails in a way that looks like a WordPress problem. */
const FOLDER = target.src[target.src.length - 1];

const files = walk(SRC)
  .map((full) => ({
    name: `${FOLDER}/${relative(SRC, full).split('\\').join('/')}`,
    body: readFileSync(full),
    mtime: statSync(full).mtime,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** DOS timestamp — two 16-bit fields, seconds stored in two-second units. */
function dosTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

const locals = [];
const central = [];
let offset = 0;

for (const file of files) {
  const name = Buffer.from(file.name, 'utf8');
  const { time, date } = dosTime(file.mtime);
  const crc = crc32(file.body);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); // local file header
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(0, 8); // stored, not deflated
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(file.body.length, 18);
  local.writeUInt32LE(file.body.length, 22);
  local.writeUInt16LE(name.length, 26);
  locals.push(local, name, file.body);

  const dir = Buffer.alloc(46);
  dir.writeUInt32LE(0x02014b50, 0); // central directory header
  dir.writeUInt16LE(20, 4); // version made by
  dir.writeUInt16LE(20, 6); // version needed
  dir.writeUInt16LE(0x0800, 8);
  dir.writeUInt16LE(0, 10);
  dir.writeUInt16LE(time, 12);
  dir.writeUInt16LE(date, 14);
  dir.writeUInt32LE(crc, 16);
  dir.writeUInt32LE(file.body.length, 20);
  dir.writeUInt32LE(file.body.length, 24);
  dir.writeUInt16LE(name.length, 28);
  /* External attributes: unix mode 0644 in the high word. `>>> 0` because the
     shift alone lands past 2^31 and JS bitwise ops hand back a signed int. */
  dir.writeUInt32LE((0o100644 << 16) >>> 0, 38);
  dir.writeUInt32LE(offset, 42);
  central.push(dir, name);

  offset += local.length + name.length + file.body.length;
}

const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);

const zip = Buffer.concat([...locals, centralBuf, end]);
writeFileSync(OUT, zip);

/* The plugin keeps its version in a PHP constant, the theme in the style.css
   header. Keyed off the target rather than sniffed from the file list, whose
   entries carry the top-level folder and so never match a bare filename. */
const version =
  name === 'plugin'
    ? readFileSync(join(SRC, 'thallo-visibility.php'), 'utf8').match(/THALLO_VIS_VERSION',\s*'([^']+)'/)?.[1]
    : readFileSync(join(SRC, 'style.css'), 'utf8').match(/^\s*Version:\s*(.+)$/m)?.[1].trim();

console.log(`${OUT}`);
console.log(`  version ${version ?? '?'} · ${files.length} files · ${(zip.length / 1024).toFixed(0)}KB`);
console.log(`  sha256 ${createHash('sha256').update(zip).digest('hex').slice(0, 16)}`);
