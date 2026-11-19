// Leonida Trophy Guide — hand-in program (Node 22+, standard library only).
//
// The guide itself is plain static files under app/ (index.html, look.css,
// main.js, store.js and the data files), so it opens in any desktop browser
// with the network off. This program is only the hand-in: it stages a copy
// of app/ and screenshots/ under the output directory and writes the
// dossier the judge reads, using the vendored make.fun library —
// vendor/makefun-frontend.ts stays exactly as the kit ships it, because the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const dossierLimits = {
  app_max_bytes: 50331648,
  app_max_files: 993,
  screenshots: { max: 4, max_bytes: 262144 },
  text_max_bytes: 163840,
};

function stageDirectory(sourceName, destinationName) {
  const source = join(repoRoot, sourceName);
  const destination = join(targetDir, destinationName);
  if (!existsSync(source)) return;
  rmSync(destination, { force: true, recursive: true });
  cpSync(source, destination, { recursive: true });
}

mkdirSync(targetDir, { recursive: true });
stageDirectory('app', 'app');
stageDirectory('screenshots', 'screenshots');

const dossierText = buildDossier(targetDir, dossierLimits);
writeFileSync(join(targetDir, 'dossier.json'), dossierText);
console.log(`Leonida Trophy Guide handed in to ${targetDir}`);
