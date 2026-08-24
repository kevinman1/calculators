---
name: new-calculator
description: Build a new calculator page for the Wise Financial Cambodia site, or make an existing page's text translatable. Use when asked to add a calculator, build a calculator, create a new calculator page, wire a page up for translation, add data-i18n attributes, or fix a page whose text does not switch to Khmer.
---

# Building a calculator page

Read `CLAUDE.md` first — it holds the project's reference facts (the i18n system,
the design tokens, which files the admin editor owns). This skill is the
procedure: the ordered steps, and the checks that catch what usually goes wrong.

The failure mode to design against: a page that **looks** finished, calculates
correctly, and cannot be translated. It passes a casual review because English is
the default language. Nobody notices until the Khmer translator opens the editor
and the strings are not there.

---

## Before writing anything: pin down the maths

Do not start building until you can state, concretely:

- Every **input**, with its unit and a realistic default value
- Every **output**, and what it means to the reader
- The **formula**, ideally checked against a worked example with real numbers
- Anything **Cambodia-specific**: tax treatment, whether payment dates skip
  Sundays and public holidays, KHR or USD, typical local rates

If the request does not include this, ask. A wrong formula in a financial
calculator is worse than no calculator — people make real money decisions here.
Do not infer a formula from the calculator's name.

---

## Step 1 — Pick a template

Copy an existing page rather than starting from scratch. The shared header, nav,
breadcrumb, card layout, print block and footer all come free.

| Template | Use when |
|---|---|
| `emergency-fund.html` | Simple inputs → results. The smallest complete example. |
| `savings-fixed.html` | Interest maths, a chart, a comparison table. |
| `flexible-loan.html` | Date handling, payment schedules, public holidays. |
| `compound-loan-multi-rate.html` | The most thoroughly translated page — copy its i18n patterns. |

## Step 2 — Choose a key prefix

Every string on the page gets a key namespaced to that page: `ef.*` emergency
fund, `fl.*` flexible loan, `cln.*` compound loan, `cmr.*` multi-rate, `lcp.*`
loan comparison, `dti.*`, `rvb.*`, `hvb.*`, `cinf.*` inflation.

Pick a short unused prefix and use it consistently. Group within it by role:

```
myprefix.page_title      myprefix.input.loan_amount
myprefix.page_desc       myprefix.result.total_paid
myprefix.bread           myprefix.chart.title
myprefix.print_title     myprefix.sched.date
myprefix.card.inputs     myprefix.js.never_paid
```

## Step 3 — Build the page, marking text as you go

Mark every string **while writing it**. Retrofitting i18n afterwards is where
strings get missed.

- `data-title-key="myprefix.page_title"` on `<html>`
- `data-i18n="key"` on every heading, label, card header, section label, table
  header, hint, result label, and button
- `data-i18n="key"` on **every `<option>`** — dropdown options are the most
  commonly missed elements on this site
- `data-i18n-html="key"` where the text contains markup
- Keep the English as the element's inline content: it is the fallback, and it
  keeps the file readable

For strings built in JavaScript, define the helper once near the top of the page
script and route every user-visible string through it:

```js
function T(k) { return (typeof WFC !== 'undefined') ? WFC.t(k) : k; }
```

Use it for chart labels and datasets, status text, table cells built by string
concatenation, and messages like "Loan is never paid off".

**Charts update for free** if their labels go through `T()` and they are rendered
inside `calculate()` — `i18n.js` re-runs `window.calculate()` on every language
switch. If chart building lives outside `calculate()`, the chart will keep the
old language until the next recalculation.

Use the `styles.css` custom properties for colour (`--green-50`…`--green-900`,
`--text-dark`, `--text-medium`, `--text-light`, `--border`). Do not introduce new
hex values. Charts use the Chart.js 4.4.0 CDN tag already in the template's
`<head>`; there is no bundler, so any other library must also be a CDN `<script>`.

## Step 4 — Add the English strings to `lang.js`

Add your keys under `en`. **Leave Khmer out entirely** — do not invent Khmer
translations. The page falls back to English, and the admin editor lists every
key automatically for the translator to fill in.

## Step 5 — Bump the cache-buster

If `lang.js` changed, raise the version in **every** HTML file, together:

```bash
grep -o 'lang\.js?v=[0-9]*' *.html | sort | uniq -c   # all pages must agree
```

Miss this and returning visitors keep a cached `lang.js` and never see the new
text. It looks fine in a fresh browser and broken for everyone else.

## Step 6 — Add the index tile

In `index.html`, find the right column — `#savings`, `#loans`, or `#budgeting`.
A placeholder looks like:

```html
<div class="toc-item dim">
  <span class="badge soon" data-i18n="badge.soon">Soon</span>
```

A live entry is an `<a class="toc-item" href="your-page.html">`. If a placeholder
already exists for this calculator, convert it rather than adding a second entry.
Its `calc.*.name` and `calc.*.desc` keys probably already exist in `lang.js`.

---

## Step 7 — Verify before opening the PR

Run the checker:

```bash
node .claude/skills/new-calculator/check-i18n.js your-page.html
```

It reports untagged visible strings, keys referenced by the page but missing from
`lang.js`, and cache-buster mismatches. Get it to a clean report.

Then check it by hand, because the checker cannot see these:

```bash
npx serve -p 3000 .
```

- [ ] The maths is right — verify against a worked example, not by eyeballing
- [ ] Switch to **ខ្មែរ** and back. Every string changes, including dropdowns,
      chart labels and table headers
- [ ] In Khmer, text still **fits** — Khmer runs longer than English, so check
      buttons, table headers and narrow labels for overflow
- [ ] Resize narrow (375px). Wide tables scroll rather than breaking the layout
- [ ] Print preview is sensible
- [ ] No console errors

## Step 8 — Open a pull request

Never commit to `master` — calculator changes are reviewed by Kevin
(`kevinman1`) before they reach the live site.

```bash
git checkout -b add-my-calculator
git add .
git commit -m "Add my calculator"
git push -u origin add-my-calculator
```

In the PR description, say what the calculator does, **what formula it uses**,
and what you verified. The formula is the part the reviewer most needs to check
and cannot infer from the diff.

---

## Retrofitting an existing page

Same procedure, minus the page-building. Steps 2 → 7 apply unchanged.

Work through the checker's output rather than reading the file top to bottom —
that is how strings get missed. When the report is clean, switch to Khmer and
look for anything still in English; the checker only catches text it can see in
the markup, not strings concatenated in JavaScript.

Keep the diff to i18n wiring. Do not reformat, restyle, or "improve" the maths in
the same change — a reviewer needs to be able to see at a glance that behaviour
did not change.
