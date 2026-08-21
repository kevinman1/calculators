# How we publish changes

This is the guide for **Kevin** and **Cheanath**.

The website is <https://calculators.savecambodia.com>. Everything on it comes from
this GitHub repository: `kevinman1/calculators`.

---

## The main idea

The `master` branch is the live website. It is now **protected**. This means:

- Nobody can change the live site by accident.
- A change must first become a **"pull request"**. A pull request is just a
  saved change that is waiting for someone to say yes.
- Kevin says yes. Then the change goes live, about **one minute** later.

Think of it like this:

```
You make a change  →  It waits for review  →  Kevin approves  →  It goes live
```

---

## Who can do what

| | Cheanath | Kevin |
|---|---|---|
| Change translations in the editor | Yes | Yes |
| Send a change for review | Yes | Yes |
| Approve and publish a change | No | Yes |
| Change the live site directly | No | Yes (but better not to) |

---

## For Cheanath: changing Khmer or English text

This is the normal, everyday job. You do not need to install anything.

### One time only: get your key

The editor needs a **token**. A token is like a password that only works for
this one project. Make your own — do not use Kevin's.

1. Go to <https://github.com/settings/personal-access-tokens>
2. Click **Generate new token**
3. Fill in:
   - **Token name**: `calculators editor`
   - **Expiration**: 90 days
   - **Repository access**: choose **Only select repositories**, then pick
     `kevinman1/calculators`
4. Under **Permissions → Repository permissions**, set exactly these two:
   - **Contents** → *Read and write*
   - **Pull requests** → *Read and write*
5. Click **Generate token** and copy the long text it gives you.
6. Keep it somewhere safe. GitHub will not show it again.

> **Both permissions are needed.** With only *Contents*, saving will fail.

### Every time: making a change

1. Go to <https://calculators.savecambodia.com/admin.html>
2. Paste your token and click **Access Editor**
3. **Click ⬇ Backup first.** This downloads a file with all the text in it.
   Do this every time. It takes one second and it means nothing can be lost.
4. Find the text you want to change. Use the **search box** at the top — you can
   type an English word, a Khmer word, or a key name like `nav.savings`.
5. Type your new text in the box.
6. Click **💾 Save to GitHub**

You will then see a yellow bar at the top:

> **Change #12** is saved and waiting to be published. Someone with admin
> access needs to review and publish it.

That is correct. Your work is saved safely on GitHub. It is **not on the live
website yet**. Tell Kevin, and he will publish it.

### Good to know

- You can keep editing and saving many times. It all joins into the **same**
  Change number until Kevin publishes it. You do not create a mess.
- If you make a mistake, click **↩ Restore local snapshot**. This puts back the
  version from just before your last save.
- If you save something wrong and Kevin has not published yet, just fix it and
  save again.
- The **Holidays** tab and **Inflation Data** tab work the same way.

---

## For Cheanath: adding a new calculator

This one needs Git on your computer, and it always goes through review.

```bash
git clone https://github.com/kevinman1/calculators.git
cd calculators
git checkout -b my-new-calculator
```

Then:

1. Copy an existing page as your starting point. `emergency-fund.html` is a
   good simple one.
2. Add `data-i18n="some.key"` to every label, heading and dropdown option, so
   the text can be translated later.
3. Keep these two lines near the bottom of the page:
   ```html
   <script src="lang.js?v=17"></script>
   <script src="i18n.js?v=2"></script>
   ```
4. Add your new English text into `lang.js`. Khmer can be empty for now — the
   page will show English until someone translates it in the editor.
5. Add the calculator to the list on `index.html`.
6. **If you changed `lang.js`, change the version number.** Find every
   `lang.js?v=17` and make it `lang.js?v=18`. If you forget this, people who
   visited before will not see your new text.

Then send it for review:

```bash
git add .
git commit -m "Add my new calculator"
git push -u origin my-new-calculator
```

GitHub will print a link. Open it and click **Create pull request**. Then tell
Kevin.

> Do not try to push to `master`. GitHub will refuse, and say
> *"Changes must be made through a pull request."* That is not an error you did
> wrong — it is the protection working.

---

## For Kevin: publishing a change

### Translation, holiday, or inflation changes

You have two ways.

**The quick way**, from inside the editor:

1. Open <https://calculators.savecambodia.com/admin.html> and log in.
2. If something is waiting, the yellow bar appears at the top.
3. Click **Publish now**. Live in about a minute.

You see this button and Cheanath does not, because you are the repository admin.

**The careful way**, on GitHub — use this when you want to see exactly what
changed before it goes live:

1. Go to <https://github.com/kevinman1/calculators/pulls>
2. Click the change. Open the **Files changed** tab to read every edit.
3. Click **Merge pull request**.

### New calculators and code changes

Always review these on GitHub, never publish them blind.

1. Open the pull request.
2. Read **Files changed**.
3. To test it before publishing, run it on your own computer:
   ```bash
   git fetch origin
   git checkout the-branch-name
   npx serve -p 3000 .
   ```
   Then open <http://localhost:3000> in your browser.
4. If it is good, click **Merge pull request**.
5. If it needs work, write a comment saying what to fix.

### Your bypass

You can still push straight to `master` from your own computer. GitHub will
print a warning but allow it.

Use this only for small, safe, urgent fixes. For anything real, use a pull
request — that is the whole point of setting this up, and it gives you a record
of what changed and why.

---

## If something goes wrong

| Problem | What it means | What to do |
|---|---|---|
| **"Changes must be made through a pull request"** | You tried to change the live site directly. | Make a branch and open a pull request instead. |
| **Save fails: "Resource not accessible"** | Your token is missing the *Pull requests* permission. | Make a new token with both Contents and Pull requests set to *Read and write*. |
| **Save fails: "Bad credentials"** | Your token expired or was typed wrong. | Make a new token. |
| **New text does not appear on the site** | The version number was not changed. | Change every `lang.js?v=NN` to the next number, and publish that too. |
| **Text went missing** | Someone saved over it. | Nothing is ever really lost. Use **↩ Restore local snapshot**, or your **⬇ Backup** file with the **⬆ Import** button. Every old version is also kept in the repository history. |

---

## The safety nets

1. **⬇ Backup** — downloads every English and Khmer string as one file.
2. **⬆ Import** — puts a backup file back. It shows you what will change and
   asks first. It never deletes text that is missing from the file.
3. **↩ Restore local snapshot** — a copy is saved in your browser automatically
   before every save and every import.
4. **Review before publishing** — nothing reaches the live site until Kevin
   says yes.
5. **Repository history** — every version ever saved is kept, forever.
