// news-image-20261121 entry — Node 22, standard library only.
//
// The entry image lives next to this file as entry.png. It is a JPEG
// stored under a .png name: the gate tells the format from the first
// bytes, so that is fine. This program copies those exact bytes to
// /output/entry.png. It reads no input, reaches no network and stamps
// nothing time-dependent into the output, so two runs are byte-identical.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputPath = join(outputDir, 'entry.png');

// A whole JPEG opens with FFD8 and closes with FFD9; a whole PNG opens
// with the 8-byte PNG signature. Anything else means the image is
// damaged, so stop loudly instead of shipping it.
function isWholeImage(bytes: Buffer): boolean {
  const jpeg =
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9;
  const png =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  return jpeg || png;
}

const picture = readFileSync(sourcePath);
if (!isWholeImage(picture)) {
  throw new Error('entry.png is not a whole JPEG or PNG image');
}

// The gate refuses anything over 1 MiB, so check the size here too and
// fail loudly rather than submitting an entry that cannot be judged.
if (picture.length > 1048576) {
  throw new Error(
    `entry.png is ${picture.length} bytes, over the 1 MiB limit`,
  );
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, picture);

// Read the output back and compare it byte for byte with the source, so
// a short or mangled write cannot pass silently.
const copied = readFileSync(outputPath);
if (!copied.equals(picture)) {
  throw new Error('entry.png in output differs from the source image');
}

console.log(`wrote ${outputPath} (${copied.length} bytes)`);
