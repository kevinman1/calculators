#!/usr/bin/env node
/**
 * check-i18n.js — report translation gaps on a calculator page.
 *
 *   node .claude/skills/new-calculator/check-i18n.js dti-ratio.html
 *   node .claude/skills/new-calculator/check-i18n.js            # all pages
 *
 * Reports:
 *   1. visible strings in the markup with no data-i18n attribute
 *   2. keys the page references that are missing from lang.js
 *   3. keys present in English but not Khmer (expected for new work)
 *   4. lang.js cache-buster disagreement across pages
 *
 * It cannot see strings concatenated inside JavaScript. After the report is
 * clean, still switch the page to Khmer and look for leftover English.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT   = process.cwd();
const SKIP   = new Set(['admin.html', 'index.html']);
const argv   = process.argv.slice(2);

/* Elements whose text a reader sees. */
const TEXT_TAGS = 'h1|h2|h3|h4|h5|h6|label|span|div|th|td|option|button|p|legend|summary|strong|em|b|i|small|a|caption|li|dt|dd|figcaption';

/* Text we should not flag: symbols, bare numbers, template literals, entities. */
function isNoise(text) {
  if (!/[A-Za-zក-៿]{2}/.test(text)) return true;   // no real letters
  if (/^\$\{/.test(text)) return true;                        // ${...} template
  if (/^&[a-z0-9#]+;$/i.test(text)) return true;              // single entity
  if (/^[\s\d.,%:+\-–—/()]*$/.test(text)) return true;        // numeric/punct
  return false;
}

function loadStrings() {
  const raw = fs.readFileSync(path.join(ROOT, 'lang.js'), 'utf8');
  const m = raw.match(/window\.WFC_STRINGS\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!m) throw new Error('Could not parse lang.js');
  const parsed = JSON.parse(m[1]);
  return { en: parsed.en || {}, km: parsed.km || {} };
}

function auditPage(file, strings) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');

  /* Only look at the body's markup. <head> is excluded because the one string
     in it that matters — <title> — is driven by data-title-key on <html>,
     which is checked separately below. */
  let markup = raw
    .replace(/<head[\s\S]*?<\/head>/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  /* An element carrying data-i18n has its whole content replaced at runtime, so
     nested markup inside it (e.g. the <strong> in print.note) is already
     covered. Empty those elements out before scanning. */
  const tagged = new RegExp('<(' + TEXT_TAGS + ')\\b([^>]*\\bdata-i18n(?:-html)?="[^"]*"[^>]*)>[\\s\\S]*?</\\1>', 'gi');
  for (let pass = 0; pass < 3; pass++) markup = markup.replace(tagged, '<$1$2></$1>');

  /* The EN / ខ្មែរ switcher buttons name each language in that language, so
     they are deliberately never translated. */
  markup = markup.replace(/<button\b[^>]*\bdata-lang="[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');

  /* #latestLabel holds a data value (the newest CPI month), not UI copy, and the
     admin Inflation tab rewrites it by matching the exact string
     <span id="latestLabel">…</span>. Adding an attribute would stop that regex
     matching and silently break saving. Leave it alone. */
  markup = markup.replace(/<span\b[^>]*\bid="latestLabel"[^>]*>[\s\S]*?<\/span>/gi, '');

  /* Scan text nodes rather than whole elements. Element-based matching misses
     text that sits alongside a child element — e.g.
        <div class="scen-title">Rate Sensitivity <span>(ages …)</span></div>
     where "Rate Sensitivity" needs its own wrapper to be translatable. */
  const untagged = [];
  const nodeRe = /(<([a-zA-Z][\w-]*)\b[^>]*>|^)([^<>]+)/g;
  let m;
  while ((m = nodeRe.exec(markup))) {
    const openTag = m[1] || '';
    const tagName = (m[2] || 'text').toLowerCase();
    const text    = m[3].replace(/\s+/g, ' ').trim();
    if (/data-i18n/.test(openTag)) continue;   // this element is handled
    if (isNoise(text)) continue;
    untagged.push({ tag: tagName, text });
  }

  /* Deduplicate — the same label often appears in several places. */
  const seen = new Set();
  const uniqueUntagged = untagged.filter(u => {
    const k = u.tag + '|' + u.text;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  /* Keys this page references, from attributes and from T('...') calls. */
  const referenced = new Set();
  let k;
  const attrRe = /data-i18n(?:-html)?="([^"]+)"/g;
  while ((k = attrRe.exec(raw))) referenced.add(k[1]);
  const titleRe = /data-title-key="([^"]+)"/g;
  while ((k = titleRe.exec(raw))) referenced.add(k[1]);
  const tRe = /\bT\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((k = tRe.exec(raw))) referenced.add(k[1]);

  const missingEn = [...referenced].filter(x => strings.en[x] === undefined);
  const missingKm = [...referenced].filter(
    x => strings.en[x] !== undefined && !strings.km[x]
  );

  const ver = (raw.match(/lang\.js\?v=(\d+)/) || [])[1] || null;

  /* <head> is not scanned, so confirm the tab title is wired up. */
  const hasTitleKey = /data-title-key="/.test(raw);

  return { file, untagged: uniqueUntagged, missingEn, missingKm, referenced: referenced.size, ver, hasTitleKey };
}

/* ── Run ─────────────────────────────────────────────────────────────────── */
const strings = loadStrings();
const files = argv.length
  ? argv
  : fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();

let totalUntagged = 0, totalMissing = 0;
const versions = new Map();

for (const file of files) {
  const r = auditPage(file, strings);
  totalUntagged += r.untagged.length;
  totalMissing  += r.missingEn.length;
  if (r.ver) versions.set(r.ver, (versions.get(r.ver) || 0) + 1);

  const clean = !r.untagged.length && !r.missingEn.length && r.hasTitleKey;
  console.log('\n' + (clean ? 'OK  ' : '••  ') + r.file +
              '   (' + r.referenced + ' keys referenced)');

  if (!r.hasTitleKey) console.log('    no data-title-key on <html> — the browser tab title will not translate');
  if (r.untagged.length) {
    console.log('    ' + r.untagged.length + ' visible string(s) with no data-i18n:');
    r.untagged.forEach(u => console.log('      [' + u.tag + '] ' + u.text));
  }
  if (r.missingEn.length) {
    console.log('    ' + r.missingEn.length + ' key(s) used here but MISSING from lang.js:');
    r.missingEn.forEach(x => console.log('      ' + x));
  }
  if (r.missingKm.length) {
    console.log('    ' + r.missingKm.length + ' key(s) awaiting Khmer (fine for new work):');
    r.missingKm.slice(0, 12).forEach(x => console.log('      ' + x));
    if (r.missingKm.length > 12) console.log('      …and ' + (r.missingKm.length - 12) + ' more');
  }
}

console.log('\n── Summary ──────────────────────────────────────────────');
console.log('  pages checked          : ' + files.length);
console.log('  untagged strings       : ' + totalUntagged);
console.log('  keys missing from lang : ' + totalMissing);

if (versions.size > 1) {
  console.log('  cache-buster MISMATCH  : ' +
    [...versions.entries()].map(([v, n]) => 'v=' + v + ' (' + n + ' pages)').join(', '));
  console.log('    → all pages must request the same lang.js version');
} else if (versions.size === 1) {
  console.log('  cache-buster           : v=' + [...versions.keys()][0] + ' on every page ✓');
}

process.exit(totalMissing > 0 ? 1 : 0);
