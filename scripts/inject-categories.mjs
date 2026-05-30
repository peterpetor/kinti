// inject-categories.mjs
import { readFileSync, writeFileSync } from 'fs';

const generated = readFileSync('scripts/categories_output.sql', 'utf8')
  .replace(/^\uFEFF/, '').trim();

const seed = readFileSync('db/seed.sql', 'utf8');

const START_MARKER = '-- --- 1) Kateg';
const END_MARKER   = '-- --- 2) Hirdet';

const start = seed.indexOf(START_MARKER);
const end   = seed.indexOf(END_MARKER);

if (start === -1 || end === -1) {
  console.error('Markers not found in seed.sql');
  process.exit(1);
}

const newSeed =
  seed.substring(0, start) +
  '-- --- 1) Kategóriák -------------------------------------------------------------\n' +
  generated + '\n\n' +
  seed.substring(end);

writeFileSync('db/seed.sql', newSeed, 'utf8');

// Quick sanity check
const lines = newSeed.split('\n');
const catRows = lines.filter(l => /^\s+\('/.test(l) && l.includes(', '));
console.log('Injected category rows:', catRows.length);
console.log('First row:', catRows[0]);
console.log('Last cat row:', catRows[catRows.length - 1]);
