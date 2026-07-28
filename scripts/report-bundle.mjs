import { gzipSync } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDirectory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const supportedExtensions = new Set(['.css', '.js']);

let assetNames;
try {
  assetNames = await readdir(assetsDirectory);
} catch {
  console.error('No production bundle was found. Run "npm run build" first.');
  process.exitCode = 1;
  process.exit();
}

const assets = await Promise.all(
  assetNames
    .filter((name) => supportedExtensions.has(extname(name)))
    .map(async (name) => {
      const path = join(assetsDirectory, name);
      const [contents, file] = await Promise.all([readFile(path), stat(path)]);
      return { gzipBytes: gzipSync(contents).byteLength, name, rawBytes: file.size };
    }),
);

const formatKilobytes = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;
const rows = assets
  .sort((left, right) => right.gzipBytes - left.gzipBytes)
  .map(({ gzipBytes, name, rawBytes }) => ({
    asset: name,
    gzip: formatKilobytes(gzipBytes),
    raw: formatKilobytes(rawBytes),
  }));

console.table(rows);
console.log(
  `Total JavaScript and CSS: ${formatKilobytes(
    assets.reduce((total, asset) => total + asset.rawBytes, 0),
  )} raw / ${formatKilobytes(assets.reduce((total, asset) => total + asset.gzipBytes, 0))} gzip`,
);
