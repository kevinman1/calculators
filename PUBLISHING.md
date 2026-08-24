# How we publish changes

This is the guide for **Kevin** and **Cheanath**.

The website is <https://calculators.savecambodia.com>. Everything on it comes from
this GitHub repository: `kevinman1/calculators`.

---

## Two kinds of change

They work differently. This is the most important thing on this page.

| | Changing text | Changing calculators |
|---|---|---|
| What it is | Khmer or English wording, holidays, CPI numbers | New calculators, or changes to how one works |
| Where you do it | The web editor | With Claude, or by hand in GitHub |
| Needs approval? | **No** | **Yes — Kevin reviews first** |
| How long until live | About one minute | After Kevin merges it |

Text changes go live on their own. Calculator changes get read by Kevin first.

---

## Changing text — for Cheanath

This is the everyday job. You do not need to install anything, and you do not
need to wait for anyone.

### One time only: get your key

The editor needs a **token**. A token is like a password that works for this one
project only. Make your own — do not use Kevin's.

1. Go to <https://github.com/settings/personal-access-tokens>
2. Click **Generate new token**
3. Name it `calculators editor`, and set expiry to 90 days
4. For **Repository access**, choose **Only select repositories** and pick
   `kevinman1/calculators`
5. Under **Permissions → Repository permissions**, set:
   - **Contents** → *Read and write*
6. Click **Generate token** and copy the long text
7. Keep it somewhere safe. GitHub will not show it again.

### Every time: making a change

1. Open <https://calculators.savecambodia.com/admin.html>
2. Paste your token and click **Access Editor**
3. **Click ⬇ Backup first.** This downloads a file holding every English and
   Khmer string. It takes one second, and it means nothing can be lost.
4. Find your text with the **search box**. You can type an English word, a Khmer
   word, or a key name like `nav.savings`.
5. Type the new text
6. Click **💾 Save to GitHub**

It says **Saved ✓ — live in ~1 minute**. That is all. Your change is on the real
website. Nobody needs to approve it.

Wait a minute, then open the page on the website and check it looks right —
especially that longer Khmer sentences still fit inside buttons and labels.

### If you make a mistake

- Click **↩ Restore local snapshot**. This puts back the version from just
  before your last save. Then save again.
- Or click **⬆ Import** and choose one of your backup files. It shows you what
  will change and asks before doing anything.
- Nothing is ever really lost. Every version ever saved is kept in the
  repository history.

The **Holidays** and **Inflation Data** tabs work the same way.

---

## Changing calculators — new ones, or fixing existing ones

This always gets reviewed, because a broken calculator gives people wrong
numbers about their money.

### Please do not push straight to `master`

GitHub will technically allow it. We are asking you not to. Use a branch and a
pull request, so Kevin can read the change before real people see it.

A **pull request** is just a saved change with a "please check this" note
attached.

There are a few ways to make one. Pick the easiest that does the job.

### Way 1: ask Claude to build it

This is Cheanath's normal way of working. Claude is connected to the repository,
so it can write the calculator and open the pull request for you.

**You do not need to explain the project rules.** There is a `CLAUDE.md` file in
the repository, and Claude reads it automatically. It already knows to work on a
branch, to mark every label for translation, to leave the Khmer empty for the
translator, and to raise the `lang.js` version number.

What Claude *cannot* guess is the maths. Be specific about:

- **What goes in** — every input, and its unit. "Loan amount in USD", "annual
  interest rate as a percent", "term in months".
- **What comes out** — every number you want shown, and what it means.
- **How it is calculated** — the formula, or a worked example with real numbers.
  If you have a spreadsheet that already does it, describe how it works.
- **Anything Cambodia-specific** — tax rates, whether payments skip Sundays and
  public holidays, KHR or USD.

A useful thing to say at the end:

> Work on a branch and open a pull request. Do not commit to master.
> Check the page in both English and Khmer before you finish.

When Claude is done it gives you a pull request link. Open it, look it over, then
tell Kevin. He reviews the numbers and merges it.

> Claude is good at building the page and wiring up the translations. It cannot
> know whether the interest formula matches how Cambodian lenders actually work.
> That is why Kevin reviews it, and why a worked example in your instructions is
> worth more than a long description.

### Way 2: on the GitHub website — nothing to install

Best for fixing a small thing in a page by hand.

1. Open the file on <https://github.com/kevinman1/calculators>
2. Click the **pencil** icon (top right of the file)
3. Make your change
4. At the bottom, choose **"Create a new branch for this commit and start a
   pull request"**
5. Click **Propose changes**, then **Create pull request**
6. Tell Kevin

That is a complete contribution. No Git, no terminal.

### Way 3: the browser editor — for bigger changes

Best for making a whole new calculator, or changing several files.

1. Open <https://github.com/kevinman1/calculators>
2. Press the **`.`** key (full stop). A code editor opens in your browser.
3. Make your changes. Follow the checklist below.
4. Use the **Source Control** panel on the left to create a branch and commit
5. It offers to open a pull request when you are done

### Way 4: Git on your computer — for testing before you send

Only needed when you want to run the site and try the calculator yourself
first.

```bash
git clone https://github.com/kevinman1/calculators.git
cd calculators
git checkout -b my-new-calculator
```

### The checklist, whichever way you chose

1. Copy an existing page as your starting point. `emergency-fund.html` is a good
   simple one.
2. Put `data-i18n="some.key"` on every label, heading and dropdown option, so the
   text can be translated in the editor later.
3. Keep these two lines near the bottom of the page:
   ```html
   <script src="lang.js?v=17"></script>
   <script src="i18n.js?v=2"></script>
   ```
4. Add your new English text to `lang.js`. Khmer can be empty — the page shows
   English until someone translates it.
5. Add the calculator to the list on `index.html`.
6. **If you changed `lang.js`, raise the version number.** Change every
   `lang.js?v=17` to `lang.js?v=18`. Forget this, and people who visited before
   will not see your new text.

### If you used Way 4: check it, then send it

Try it on your own computer first:

```bash
npx serve -p 3000 .
```

Open <http://localhost:3000> in your browser and use the calculator. Check the
numbers are right, and switch to Khmer to see the text still fits.

Then send it:

```bash
git add .
git commit -m "Add my new calculator"
git push -u origin my-new-calculator
```

GitHub prints a link. Open it, click **Create pull request**, then tell Kevin.

### What happens next

Kevin reads your change and either **approves and merges** it — live about a
minute later — or leaves a comment asking for something to be fixed. If he asks
for a change, just make it the same way you made the first one; it joins the
same pull request automatically.

Please wait for Kevin to merge it, even though GitHub would let you do it
yourself.

---

## Reviewing and publishing — for Kevin

### Where to look

<https://github.com/kevinman1/calculators/pulls>

Bookmark it. Anything waiting for you is there. You should also get an email
when a pull request opens — check that notifications are on at
<https://github.com/settings/notifications>, and consider the GitHub mobile app.

Text changes will **not** appear here. Those go straight to the site by design.

### Reviewing a calculator change

1. Open the pull request and read the **Files changed** tab.
2. Try it on your own computer before publishing:
   ```bash
   git fetch origin
   git checkout the-branch-name
   npx serve -p 3000 .
   ```
   Then open <http://localhost:3000>.
3. Good? Click **Merge pull request**. Live in about a minute.
4. Needs work? Leave a comment saying what to fix.

### Your own calculator work

Nothing forces you to use a pull request — you can push to `master` directly.
For a new calculator or a change to how one calculates, open a pull request
anyway. It gives you a diff to read before it goes live, and a record of why the
change was made.

---

## What the branch protection actually does

`master` is protected against **accidents**, not against people:

- **Force-pushes are blocked.** Nobody can overwrite the history of the live
  site, so no work can be erased.
- **Branch deletion is blocked.** The live site cannot be deleted.

It does **not** require approval. GitHub cannot require approval for calculator
files while letting text changes through — protection applies to a whole branch,
not to particular files — so review is a habit we keep, not a gate GitHub
enforces.

---

## If something goes wrong

| Message | What it means | What to do |
|---|---|---|
| **"Bad credentials"** | Your token expired, or was pasted wrong. | Make a new token. |
| **"Resource not accessible"** | Your token is missing *Contents → Read and write*. | Make a new token with that permission. |
| **New text does not appear** | The version number was not raised, or you are seeing a cached page. | Refresh with Ctrl+Shift+R. If it is a new key, change every `lang.js?v=NN` to the next number. |
| **Text has gone missing** | Someone saved over it. | **↩ Restore local snapshot**, or **⬆ Import** a backup file. Old versions are also in the repository history. |
| **A calculator is broken on the live site** | A change went out that should have been reviewed. | `git revert` the commit, or ask Kevin to. The old version is never gone. |

---

## The safety nets

1. **⬇ Backup** — downloads every English and Khmer string as one file.
2. **⬆ Import** — puts a backup back. Shows what will change and asks first, and
   never deletes text missing from the file.
3. **↩ Restore local snapshot** — saved in your browser automatically before
   every save and every import.
4. **Review for calculators** — no calculator change should reach the site
   without Kevin reading it.
5. **Repository history** — every version ever saved is kept, permanently, and
   the history cannot be overwritten.
