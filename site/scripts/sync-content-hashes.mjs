import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const MANIFEST_PATH = join(ROOT, 'site/src/data/.content-hashes.json');

const TRACKED_FILES = [
  'examples/veterinary-clinic/pass-1/gap-report.md',
  'examples/veterinary-clinic/pass-1/gap-resolution-log.md',
  'examples/veterinary-clinic/pass-2/gap-report.md',
  'examples/veterinary-clinic/pass-2/gap-resolution-log.md',
  'examples/veterinary-clinic/pass-3/gap-report.md',
  'docs/gap-categories.md',
];

async function hashFile(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

async function main() {
  const sources = {};
  for (const file of TRACKED_FILES) {
    const fullPath = join(ROOT, file);
    sources[file] = await hashFile(fullPath);
  }

  const manifest = {
    sources,
    lastSynced: new Date().toISOString(),
  };

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log('✅ Content hashes synced.');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
