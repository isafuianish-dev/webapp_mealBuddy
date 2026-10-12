# Meal Buddy

Plan a whole week of meals at a glance — breakfast, lunch and dinner for every day, with a separate plan for each person.

Meal Buddy is a lightweight weekly meal planner. Pick a day from the sidebar and fill in what's on the menu for breakfast, lunch and dinner. Every meal is split into two columns — **Male** and **Female** — so you can plan different portions or dishes for each person without keeping two separate lists. Everything saves to your browser automatically as you type.

## Features

- **Seven-day sidebar** — Monday through Sunday down the left side. The current weekday is tagged **Today**, and each day shows how many of its six meal slots are filled (e.g. `4/6`).
- **Three meals per day** — Breakfast, Lunch and Dinner, each in its own card in the main view.
- **Two people per meal** — every meal has a **Male** and a **Female** field, so each person gets their own plan for the same slot.
- **Autosave** — notes are written to your browser's local storage as you type; there's no save button and nothing to lose on refresh.
- **Copy a day** — copy every meal from the day you're viewing onto another day, handy when a plan repeats across the week.
- **Clear a day** — wipe all six fields for the current day in one step (with a confirmation).
- **Print / export to PDF** — generate a clean, printable table of the full week (one table per day, meals as rows, people as columns) and print it or save it as a PDF.
- **Backup and restore** — export the entire plan as a JSON file, and import it back later or on another device.
- **Light and dark themes plus accent colors** — set from the Settings panel; your choice is remembered.
- **Responsive layout** — the day list moves above the detail view on narrow screens, and the Male/Female columns stack on very small screens.

## How to Use

### Planning meals

1. Click a day in the left sidebar (it opens on today's weekday by default).
2. In the main view you'll see three cards: **Breakfast**, **Lunch** and **Dinner**.
3. Each card has a **Male** box and a **Female** box — type what that person is eating for that meal. You can write as much as you like; the box grows and scrolls.
4. Move to another day whenever you want. Your entries are saved automatically.

The count next to each day in the sidebar (`0/6` up to `6/6`) updates live as you fill boxes in, so you can see at a glance which days still need attention. A day that's completely planned shows its count in green.

### Copying a day

If two days share the same menu, open the day you've already filled in and click **Copy to…**. Pick a target day from the list — its current meals are replaced with a copy of the day you're viewing.

### Clearing a day

Click **Clear day** to empty all six fields for the day you're viewing. You'll be asked to confirm first, and the action can't be undone.

### Printing or exporting a PDF

Click the document icon in the top-right toolbar. Meal Buddy builds a printable page with a heading and a small table for every day of the week, then opens your browser's print dialog. From there you can send it to a printer or choose "Save as PDF".

## Customization

Click the gear icon in the top-right corner to open **Settings**, where you can:

- Switch between **Light** and **Dark** theme.
- Choose an **accent color** for the interface.
- Set **motion** (animations) to on, reduced, or follow your system setting.

Settings are saved automatically and reapplied next time you open the app.

## Data & Backups

Everything you enter is stored only in your browser, on your own device. Nothing is uploaded, and there's no account or sign-in.

Because the data lives in that one browser, export a backup now and then — especially before clearing your browser data or moving to another device:

- **Export**: click the download icon in the toolbar to save the whole plan as `mealbuddy-plan.json`.
- **Import**: click the upload icon and choose a previously exported file. Importing **replaces** your current plan with the file's contents, so export first if you want to keep what you have.

## Tips

- The **Today** tag follows your device's clock — open the app any day and it lands on the right weekday.
- Meal Buddy plans a single repeating week, not specific calendar dates. Use **Copy to…** to roll a good day forward, or **Export** at the end of a week to keep a record.
- The Male / Female split is just two labelled columns — use them for whatever two-way split fits your household (two people, adults vs. kids, etc.).

---

Made by [Anish Safui](https://github.com/isafuianish-dev).
