# SMART SUPERVISION 360°
ระบบนิเทศภายในโรงเรียนอัจฉริยะ — Google Apps Script + Google Sheets + Google Drive

This is a real, working web app: browser frontend (`src/*.html`) served by a Google Apps
Script backend (`src/*.gs`), using a Google Sheet as the database and a Drive folder for
evidence file storage. There is no external hosting or database to pay for — it runs
entirely inside your school's Google account.

## What's implemented

- **Dashboard** — KPI cards (teachers, observation count, observed/not-observed, average
  score) + monthly observation chart, quality-level distribution, follow-up status, upcoming
  plans.
- **แผนการนิเทศ (Supervision plans)** — create plans (semester, date, supervisor, teacher,
  topic), list/cancel them, auto-marked "เสร็จสิ้น" once an observation is filed against them.
- **แบบสังเกตการสอนออนไลน์ (Online observation form)** — 5 domains × 3 items each, 1–5 rating
  buttons, live score summary, automatic level classification (ดีเยี่ยม/ดีมาก/ดี/พอใช้/ควรพัฒนา).
- **ข้อเสนอแนะและติดตามผล (Feedback & follow-up)** — supervisor records strengths /
  improvement areas / suggestions at submission time; teachers see their own history and log
  their own progress/response and status.
- **คลังหลักฐาน (Evidence repository)** — upload images/PDF/Word/PowerPoint, stored to Drive
  automatically, searchable, optionally linked to a specific observation.
- **รายงานอัตโนมัติ (Auto reports)** — filter by teacher/subject group/date range, export to
  CSV (opens correctly in Excel with Thai text) or PDF.
- **Role-based access** — ผู้ดูแลระบบ (Admin), ผู้บริหาร (Executive/supervisor), ครู (Teacher),
  enforced both in the UI and again on every server call.
- **Google Account login** — no separate password system; identity comes from Google Workspace
  sign-in.

## Project layout

```
src/
  appsscript.json     manifest (scopes, web app access mode)
  Code.gs              doGet() entry point + include() helper
  Config.gs            sheet names, roles, the 5-domain rubric, level thresholds
  SheetService.gs      generic sheet-as-database CRUD helpers
  Auth.gs              current-user resolution + role bootstrap
  DriveService.gs       evidence file upload to Drive
  Api.gs               every google.script.run function the frontend calls
  Index.html            page shell (sidebar nav + topbar)
  Styles.html           all CSS
  ClientScript.html    all frontend JS (router, forms, charts)
  Dashboard.html / Plans.html / Observation.html / Feedback.html /
  Evidence.html / Reports.html / Users.html   one partial per screen
```

No spreadsheet ID or folder ID needs to be configured by hand — the first time the app runs,
`Config.gs` creates a spreadsheet named **"SMART SUPERVISION 360 - Database"** and a Drive
folder named **"SMART SUPERVISION 360 - หลักฐาน"**, and remembers their IDs in Script
Properties. The **first person** to open the deployed app is automatically made **Admin**;
everyone after that starts as **ครู (Teacher)** until an Admin changes their role under
"จัดการผู้ใช้".

## Deploying

You'll need [`clasp`](https://github.com/google/clasp) (Google's Apps Script CLI) and a
Google account with access to Apps Script.

```bash
npm install -g @google/clasp
clasp login
cd c:\schoolquality
clasp create --type webapp --title "SMART SUPERVISION 360" --rootDir src
```

That generates `src/.clasp.json` with a real `scriptId`. Then:

```bash
clasp push
clasp deploy --description "v1"
```

`clasp deploy` prints a web app URL — that's the app. Share that URL with staff.

**Alternative (no clasp):** open [script.google.com](https://script.google.com), create a new
project, and manually create/paste each file from `src/` (matching filenames, including the
`.html` ones — Apps Script strips the extension automatically for HTML files, so name them
`Index`, `Styles`, `ClientScript`, etc.). Then use **Deploy → New deployment → Web app**.

### Web app access settings (important)

`appsscript.json` is set to:
```json
"webapp": { "access": "DOMAIN", "executeAs": "USER_ACCESSING" }
```
This means: anyone signed into your school's **Google Workspace domain** can open the app,
and it runs under *their own* Google identity (so `Session.getActiveUser()` reliably returns
the real signed-in user, and the audit trail on every plan/observation/upload is accurate).

Because it runs as the accessing user, each staff member's Google account needs at least
**view access** to the auto-created spreadsheet/Drive folder for the app to read/write data
under their identity — share the "SMART SUPERVISION 360 - Database" spreadsheet and the
evidence folder with your staff (e.g. "Anyone in [yourschool.ac.th] with the link can edit"),
or with a specific Google Group. The web app's own role checks (Admin/Executive/Teacher) are
the real access-control layer on top of that.

If you're not on Google Workspace (e.g. testing with a personal Gmail account), change
`access` to `"MYSELF"` for private testing, or `"ANYONE"` if you accept that unauthenticated
visitors could load the page shell (they still can't read data without a resolvable identity).

### First run checklist

1. Deploy the web app and open the URL as the account that should be the school's system
   admin — they become **ผู้ดูแลระบบ** automatically.
2. Go to **จัดการผู้ใช้** and add your teachers/executives (email, name, role, กลุ่มสาระ). Anyone
   not yet added is auto-created as a Teacher the first time they open the app, so you can also
   just let staff log in once and then promote them from that screen.
3. Go to **แผนการนิเทศ** and create your first supervision plan.
4. Use **สังเกตการสอน** to record an observation against that plan.

## Tech stack (matches the original spec)

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML5, CSS3, vanilla JavaScript, Chart.js |
| Backend    | Google Apps Script                   |
| Database   | Google Sheets                        |
| Storage    | Google Drive                         |
| Auth       | Google Account (Workspace domain)    |
