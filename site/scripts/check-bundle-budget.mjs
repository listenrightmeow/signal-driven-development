import { readdir, stat, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = new URL('../dist', import.meta.url).pathname;

const BUDGETS = {
  criticalHtml: { limit: 30_000, label: 'Critical HTML (index.html)' },
  totalJs: { limit: 100_000, label: 'Total JS' },
  totalCss: { limit: 20_000, label: 'Total CSS' },
  totalSite: { limit: 150_000, label: 'Total site (excl. images/fonts)' },
};

async function walkDir(dir, ext) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await walkDir(fullPath, ext)));
      } else if (!ext || ext.includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return files;
}

async function gzipSize(filePath) {
  const content = await readFile(filePath);
  return gzipSync(content).length;
}

async function main() {
  const results = {};
  let failed = false;

  // Critical HTML
  const indexPath = join(DIST, 'index.html');
  results.criticalHtml = await gzipSize(indexPath);

  // Total JS
  const jsFiles = await walkDir(DIST, ['.js', '.mjs']);
  let totalJs = 0;
  for (const f of jsFiles) totalJs += await gzipSize(f);
  results.totalJs = totalJs;

  // Total CSS
  const cssFiles = await walkDir(DIST, ['.css']);
  let totalCss = 0;
  for (const f of cssFiles) totalCss += await gzipSize(f);
  results.totalCss = totalCss;

  // Total site (excl. images and fonts)
  const allFiles = await walkDir(DIST);
  const excluded = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf'];
  let totalSite = 0;
  for (const f of allFiles) {
    if (!excluded.includes(extname(f))) {
      totalSite += await gzipSize(f);
    }
  }
  results.totalSite = totalSite;

  // Report
  console.log('\n📦 Bundle Budget Report\n');
  for (const [key, budget] of Object.entries(BUDGETS)) {
    const actual = results[key];
    const pass = actual <= budget.limit;
    const icon = pass ? '✅' : '❌';
    const pct = ((actual / budget.limit) * 100).toFixed(1);
    console.log(`${icon} ${budget.label}: ${(actual / 1024).toFixed(1)}KB / ${(budget.limit / 1024).toFixed(1)}KB (${pct}%)`);
    if (!pass) failed = true;
  }

  console.log('');
  if (failed) {
    console.error('❌ Bundle budget exceeded!');
    process.exit(1);
  } else {
    console.log('✅ All budgets within limits.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
