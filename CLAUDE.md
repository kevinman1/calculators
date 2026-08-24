# Wise Financial Cambodia — calculators

Bilingual (English / Khmer) financial-education calculators for Cambodia.
Live at <https://calculators.savecambodia.com>.

Plain static site. **No build step, no framework, no package.json.** Every page is
a self-contained HTML file with its own inline `<style>` and `<script>`. GitHub
Pages serves the `master` branch root directly, so a merge is a deploy —
live about a minute later.

Run it locally with `npx serve -p 3000 .` and open <http://localhost:3000>.

---

## Workflow: always use a branch and a pull request

**Do not commit to `master`.** Even though `master` is not gated, calculator
changes are reviewed by Kevin (`kevinman1`) before they go live, because a wrong
calculator gives people wrong numbers about their money.

```bash
git checkout -b short-description-of-change
# ...work...
git push -u origin short-description-of-change
```

Then open a pull request and say what changed and what you verified. If you have
`gh` available, `gh pr create` is fine.

Force-pushes and branch deletion on `master` are blocked at the GitHub level.

---

## The i18n system — read this before editing any page

This is the part most easily broken in a way that looks fine locally and fails
for real users. Every visible string must be translatable.

**Load order matters.** These two lines go at the end of `<body>`, `lang.js`
first, before any page script that calls `T()`:

```html
<script src="lang.js?v=17"></script>
<script src="i18n.js?v=2"></script>
```

**Marking text in HTML:**

| Attribute | Use for |
|---|---|
| `data-i18n="key"` | Normal text. Replaces `textContent`. |
| `data-i18n-html="key"` | Text containing markup, e.g. the print note with `<strong>`. |
| `data-i18n="key"` on `<option>` | Dropdown options — these are frequently missed. |
| `data-title-key="key"` on `<html>` | The browser tab title. `i18n.js` appends `" | Wise Financial Cambodia"`. |

Keep the English as the element's inline content too — it is the fallback if a
key is missing, and it keeps the file readable.

**Strings built in JavaScript** use the `T()` helper, defined per page as:

```js
function T(k) { return (typeof WFC !== 'undefined') ? WFC.t(k) : k; }
```

Never concatenate untranslated English in generated HTML — schedule tables and
status labels all go through `T()`.

**Adding keys.** `lang.js` is one flat object, `window.WFC_STRINGS = { en: {...},
km: {...} }`, keys dotted and namespaced per calculator (`ef.*` emergency fund,
`fl.*` flexible loan, `cln.*` compound loan, `cmr.*` multi-rate, `lcp.*` loan
comparison, `cinf.*` inflation). Give a new calculator its own short prefix.

Add the English. **Leave Khmer empty or omit it** — the Khmer translator fills it
in through the admin editor, which lists every key automatically. Do not invent
Khmer translations.

### The cache-buster rule

**If you change `lang.js`, raise the version number in every HTML file.**

```bash
# every page must request the same version
grep -o 'lang\.js?v=[0-9]*' *.html | sort | uniq -c
```

Currently `v=17` across all 19 pages. Bump all of them together to `v=18`.
Miss this and returning visitors keep a cached `lang.js` and never see the new
text — the change looks fine in a fresh browser and broken for everyone else.

### Khmer layout

Khmer runs longer than English and wraps differently. `i18n.js` puts a `lang-km`
class on `<html>` when Khmer is active. After adding UI, switch to Khmer and
check text still fits inside buttons, table headers and labels.

---

## Building a new calculator

Copy an existing page rather than starting blank — `emergency-fund.html` is the
simplest complete example; `flexible-loan.html` shows date handling and holidays.

Keep the shared page anatomy: `<header>` with nav and the EN/ខ្មែរ language
buttons, `.breadcrumb`, an `<h2>` page title, `.card` / `.card-header` /
`.card-body` blocks for inputs and results, the print note and print button, then
`<footer>`.

Then wire it up:

1. `data-title-key` on `<html>`, and `data-i18n` on every label, heading and
   `<option>`
2. English strings into `lang.js` under a new prefix
3. Bump `lang.js?v=` across all pages
4. Add a tile to `index.html` in the right column (`#savings`, `#loans`, or
   `#budgeting`). Placeholders are `<div class="toc-item dim">` with a
   `badge soon`; a live one is `<a class="toc-item" href="page.html">`
5. Run it locally, check both languages, check it prints

**Use the shared design tokens** from `styles.css` — `--green-50` through
`--green-900`, `--text-dark`, `--text-medium`, `--text-light`, `--border`,
`--white`. Do not introduce new hex colours.

Charts use Chart.js 4.4.0 from jsDelivr, loaded per page in `<head>`. There is no
bundler, so any library must be a CDN `<script>`.

---

## Files managed by the admin editor — do not hand-edit

`admin.html` is a browser-based editor that commits to this repo through the
GitHub API. It owns:

| File | Holds |
|---|---|
| `lang.js` | All translations. Adding English keys in a PR is fine; do not rewrite Khmer. |
| `holidays.js` | `window.WFC_HOLIDAYS`, a Set of `YYYY-MM-DD` Cambodian public holidays, used for payment-date adjustment. Edited via the Holidays tab. |
| `cambodia-inflation.html` | The `CPI_DATA` array near the top. Edited via the Inflation Data tab. Leave that block alone; the editor rewrites it by string match and is sensitive to its exact shape. |

The editor renders a row for **every** key in `lang.js`, discovering anything its
curated `SECTIONS` list does not mention and grouping it by prefix. So a new key
appears for translation automatically — no editor change needed.

---

## Conventions worth matching

- Two-space indent in HTML; `'use strict'` at the top of page scripts
- Section-divider comments (`// ── State ───…`) are used throughout; match the
  local style
- Currency is USD and KHR; the KHR/USD default rate is 4,000
- `favicon.svg` and `CNAME` are shared and should not be touched
- `PUBLISHING.md` documents the human workflow for the team; keep it accurate if
  the workflow changes
