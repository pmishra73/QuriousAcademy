# Qurious Academy — Operations & Developer Guide

Everything you need to run, maintain, and extend the site.

---

## Table of Contents

1. [Access & Credentials](#1-access--credentials)
2. [Environment Variables](#2-environment-variables)
3. [Architecture Overview](#3-architecture-overview)
4. [Course Management](#4-course-management)
5. [Brochure PDFs](#5-brochure-pdfs)
6. [Payments (Razorpay)](#6-payments-razorpay)
7. [Email (Resend)](#7-email-resend)
8. [Database (Neon Postgres)](#8-database-neon-postgres)
9. [Admin Panel](#9-admin-panel)
10. [Key Public Pages](#10-key-public-pages)
11. [Deployment (Vercel)](#11-deployment-vercel)
12. [Common Tasks](#12-common-tasks)
13. [Codebase Map](#13-codebase-map)

---

## 1. Access & Credentials

### Admin Panel

| Field    | Value                        |
|----------|------------------------------|
| URL      | `/admin`                     |
| Email    | `mishraprasant73@gmail.com`  |
| Password | *(set at account creation — reset via seed endpoint below if forgotten)* |
| Role     | `admin`                      |

**If you need to reset the admin password**, hit the seed endpoint with a new password:

```bash
curl -X POST https://quriousacademy.com/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "qa-seed-2026",
    "name": "Prasant Mishra",
    "email": "mishraprasant73@gmail.com",
    "password": "YOUR_NEW_PASSWORD"
  }'
```

> Note: The endpoint returns `409 User already exists` if the email is taken. To reset a password, update it directly in the database instead (see §8).

### Email Accounts

| Account                          | Purpose                          |
|----------------------------------|----------------------------------|
| `hello@quriousacademy.com`       | Outbound emails (brochures, enrollment confirmations, admin alerts) |
| `mishraprasant73@gmail.com`      | Admin notifications land here    |

### Third-Party Services

| Service     | Login                              | Dashboard URL                             |
|-------------|-----------------------------------|-------------------------------------------|
| Resend      | Sign in with Google/email          | `resend.com/emails`                       |
| Razorpay    | `mishraprasant73@gmail.com`        | `dashboard.razorpay.com`                  |
| Neon DB     | Google/GitHub                      | `console.neon.tech`                       |
| Vercel      | GitHub                             | `vercel.com/dashboard`                    |

---

## 2. Environment Variables

All of these must be set in Vercel (Settings → Environment Variables) **and** in `.env.local` for local dev.

```env
# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://neondb_owner:npg_Er8pFMWN6fsd@ep-plain-dew-ahzv03uo-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# ─── Email (Resend) ──────────────────────────────────────────────────────────
RESEND_API_KEY=re_6tFVmjZo_8AyY8QUYMeJvsVAttZuS87wi
EMAIL_FROM=hello@quriousacademy.com     # "From" address on outbound emails
EMAIL_TO=hello@quriousacademy.com       # Admin receives lead/enrollment alerts here

# ─── Payments (Razorpay) ─────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX          # Replace with live key before launch
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX     # Replace with live secret before launch

# ─── Auth ────────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=qurious-academy-secret-change-in-prod   # Change before going live
AUTH_SECRET=qurious-academy-secret-change-in-prod       # NextAuth v5 alias

# ─── Admin Seed (one-time setup) ─────────────────────────────────────────────
SEED_SECRET=qa-seed-2026    # Used to protect POST /api/admin/seed

# ─── LinkedIn (blog posting + student sign-in) ────────────────────────────────
LINKEDIN_CLIENT_ID=your-linkedin-app-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-app-client-secret
# One LinkedIn Developer App with two products enabled:
#  - "Community Management API" (needs LinkedIn review) — required for posting to the org page
#  - "Sign In with LinkedIn using OpenID Connect" (self-serve) — required for student login

# ─── Student OAuth (optional — buttons hide themselves if unset) ────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

> **Before going live:** swap Razorpay test keys for live keys, and change `NEXTAUTH_SECRET` to a strong random value (`openssl rand -base64 32`).

---

## 3. Architecture Overview

```
Next.js 15 App Router (TypeScript)
├── src/app/(public)/         Public-facing pages (courses, enroll, brochure…)
├── src/app/admin/            Admin panel (auth-gated, role = admin)
├── src/app/teacher/          Teacher panel (role = teacher)
├── src/app/api/              API routes
├── src/data/courses.json     Single source of truth for all 39 course variants
├── src/lib/variants.ts       TypeScript types + helpers for courses.json
├── src/lib/courseOverrides.ts Merges JSON base with DB admin overrides
├── src/lib/mailer.ts         Resend email helper
├── src/lib/auth.ts           NextAuth v5 config (Credentials provider)
├── prisma/schema.prisma      Database schema
└── public/brochures/         Pre-generated PDF brochures (39 files)
```

**Data flow for courses:**

```
courses.json (base data)
       +
CourseOverride (DB) ← admin panel edits
       ↓
/api/courses → public courses page (hidden ones filtered out)
       ↓
/api/brochure-html/[id] → styled HTML brochure (used by PDF generator)
       ↓
public/brochures/[id].pdf → served on download
```

---

## 4. Course Management

### Course data lives in `src/data/courses.json`

39 course variants. Each variant has:

```json
{
  "id": "python-masterclass",
  "subject": "python",
  "subjectLabel": "Python",
  "icon": "Code2",             ← Lucide icon name
  "type": "masterclass",       ← masterclass | cohort | sprint | deep-dive | full-course | interview-prep | standard
  "deliveryMode": "Live",      ← Live | Live+Recorded | Recorded
  "recordedPrice": 199,        ← optional: price of recorded version
  "title": "Python",
  "tagline": "...",
  "price": 799,
  "currency": "INR",
  "duration": "3 hours",
  "level": "Beginner",         ← Beginner | Intermediate | Advanced | Beginner to Intermediate | Intermediate to Advanced
  "instructor": "Prasant Mishra",
  "schedule": { "type": "monthly-first-saturday", "time": "10:00 AM IST" },
  "content": {
    "overview": "...",
    "sessions": [ { "session": "1", "title": "...", "topics": ["..."] } ],
    "prerequisites": "...",
    "outcomes": ["..."],
    "includes": ["..."],
    "certificate": "..."
  }
}
```

### Level rules (strictly enforced)
- `Beginner`
- `Intermediate`
- `Advanced`
- `Beginner to Intermediate`
- `Intermediate to Advanced`
- **Never** `Beginner to Advanced`

### Course types & default pricing

| Type             | Duration     | Live Price    | Recorded Price |
|------------------|-------------|---------------|----------------|
| Masterclass      | 3 hours      | ₹799 (₹999 AI) | ₹199 (₹299 AI) |
| Weekend Cohort   | 1–2 days     | ₹2,999 (₹3,999 AI) | ₹1,499 (₹1,999 AI) |
| Sprint (4 weeks) | 4 weeks      | ₹5,999–₹8,999 | —              |
| Deep Dive        | 6–12 weeks   | ₹12,999–₹24,999 | —            |
| Full Course      | 6–8 months   | ₹34,999–₹1,19,999 | —          |
| Interview Prep   | Personalised | Custom        | —              |

### Hiding courses (launch with 3–4 courses)

Go to `/admin/courses` → toggle the switch next to any course. Hidden courses are invisible on the public site instantly — no redeploy needed.

### Editing a course from the admin panel

Go to `/admin/courses` → click **Edit** next to a course. You can change:
- Title, tagline
- Live price, recorded price
- Level
- Hidden status
- Batch dates (manually override the auto-computed schedule)

Changes are stored in the `CourseOverride` DB table and merge over the JSON base at runtime.

### Editing course content (curriculum, sessions, outcomes)

Edit `src/data/courses.json` directly. After editing, regenerate the PDFs:

```bash
npm run brochures:all
git add public/brochures/ && git push
```

---

## 5. Brochure PDFs

### Where PDFs are stored

`public/brochures/{courseId}.pdf` — 39 files, one per course.

### How brochures are generated

The script visits `/api/brochure-html/{courseId}` (a styled HTML page built from course data) with Puppeteer and prints it as A4 PDF.

```bash
npm run brochures          # Generate only missing PDFs
npm run brochures:all      # Regenerate all 39
node scripts/generate-brochures.mjs python-masterclass ai-cohort   # Specific courses
```

### Brochure download flow

1. Student visits `/brochure/{courseId}` → fills name, email, phone
2. POST `/api/brochure/{courseId}` → records lead in DB, sends emails
3. If `public/brochures/{courseId}.pdf` exists → served as download
4. If no PDF exists → `/api/brochure-html/{courseId}` opens as HTML in new tab

### After editing course content

Always regenerate PDFs so they stay in sync with the HTML:
```bash
npm run brochures:all
git add public/brochures/ && git push
```

---

## 6. Payments (Razorpay)

- **Test mode** is currently active (`rzp_test_…` keys).
- Switch to live keys in Vercel env vars when ready to go live.
- Payment flow: `/enroll` → `POST /api/payment/create-order` → Razorpay checkout → `POST /api/payment/verify` → enrollment created in DB → confirmation email sent.
- Refunds must be processed manually from the Razorpay dashboard.

---

## 7. Email (Resend)

All outbound email goes through [Resend](https://resend.com) using the API key above.

| Trigger                  | Recipients                                  |
|--------------------------|---------------------------------------------|
| Brochure download        | Student (PDF link) + Admin (lead alert)     |
| Course enrollment        | Student (confirmation) + Admin (sale alert) |
| Content unlock (coupon)  | Student (access link)                       |
| Enquiry / contact form   | Admin                                       |

**Sending domain:** `hello@quriousacademy.com` (verified in Resend dashboard)

If emails stop working, check:
1. Resend dashboard for API key status and send logs
2. `RESEND_API_KEY` is set in Vercel environment variables
3. Domain DNS records are still verified

---

## 8. Database (Neon Postgres)

**Connection string** (already in env):
```
postgresql://neondb_owner:npg_Er8pFMWN6fsd@ep-plain-dew-ahzv03uo-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**Connect via psql:**
```bash
psql "postgresql://neondb_owner:npg_Er8pFMWN6fsd@ep-plain-dew-ahzv03uo-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### Tables

| Table             | Purpose                                              |
|-------------------|------------------------------------------------------|
| `User`            | Admin and teacher accounts                           |
| `CourseAssignment`| Which teacher is assigned to which course            |
| `Enrollment`      | Student purchases (linked to Razorpay order)         |
| `Lead`            | Brochure download leads (name, email, phone, course) |
| `Coupon`          | Single-use discount coupons                          |
| `Session`         | Scheduled live class sessions                        |
| `Attendance`      | Per-session student attendance                       |
| `StudentNote`     | Teacher notes on enrolled students                   |
| `Resource`        | Course resource links (recordings, slides, etc.)     |
| `Announcement`    | Course announcements sent by teachers                |
| `Message`         | Contact / enquiry form submissions                   |
| `CourseOverride`  | Admin overrides on course data (hidden, price, etc.) |

### Reset admin password (direct SQL)

```bash
# Generate a bcrypt hash first
node -e "const b = require('bcryptjs'); b.hash('NEW_PASSWORD', 12).then(console.log)"

# Then update the DB
psql "..." -c "UPDATE \"User\" SET password = '\$2b\$12\$...' WHERE email = 'mishraprasant73@gmail.com';"
```

### Schema changes

Because `prisma migrate dev` fails on Node.js v22 (known `@prisma/dev` ESM issue), apply schema changes directly via psql or the Neon console, then run:

```bash
node --experimental-require-module node_modules/prisma/build/index.js generate
```

---

## 9. Admin Panel

**URL:** `/admin` (requires login as role `admin`)

| Section         | Path                       | What you can do                                          |
|----------------|----------------------------|----------------------------------------------------------|
| Dashboard       | `/admin`                   | Overview stats                                           |
| Courses         | `/admin/courses`           | Toggle visible/hidden, edit title/price/level/dates      |
| Course Edit     | `/admin/courses/[id]`      | Full edit form for a single course                       |
| Enrollments     | `/admin/enrollments`       | View confirmed enrollments, filter by course             |
| Leads           | `/admin/leads`             | Brochure download leads for follow-up                    |
| Coupons         | `/admin/coupons`           | Create/revoke discount coupons                           |
| Teachers        | `/admin/teachers`          | Add teacher accounts, assign to courses                  |
| Messages        | `/admin/messages`          | Contact form and enquiry inbox                           |
| Content         | `/admin/content`           | Course content unlock management                         |
| Profile         | `/admin/profile`           | Change your own name/password                            |

---

## 10. Key Public Pages

| Page               | URL                         | Notes                                         |
|--------------------|----------------------------|-----------------------------------------------|
| Home               | `/`                        |                                               |
| Courses catalog    | `/courses`                 | Fetches from `/api/courses` (hidden = hidden) |
| Course detail      | `/courses/[id]`            | Full curriculum, dates, enroll CTA            |
| Brochure download  | `/brochure/[id]`           | Lead capture → PDF download                   |
| Enroll / Pay       | `/enroll?course=[id]`      | Razorpay checkout                             |
| Contact            | `/contact`                 | Enquiry form                                  |
| About              | `/about`                   |                                               |
| Blog / Resources   | `/blog`                    |                                               |
| Teach with us      | `/teach`                   |                                               |
| Corporate          | `/corporate`               |                                               |
| Institutes         | `/institutes`              |                                               |
| Staff login        | `/login`                   | Admin + teacher login                         |

---

## 11. Deployment (Vercel)

The repo is connected to Vercel via GitHub. Every push to `main` triggers a deploy.

**Build command:** `prisma generate && next build`  
**Output directory:** `.next`  
**Node version:** 22.x

### Deploy environment variables

All variables from §2 must be set in Vercel → Project → Settings → Environment Variables.

### After schema changes

Prisma client is regenerated during build (`prisma generate` in build command), so no manual step needed on Vercel. The DB table must already exist (apply via psql before deploying).

### Vercel CLI (upgrade recommended)

```bash
npm i -g vercel@latest   # Current: 50.38.2 → upgrade to 54+
```

---

## 12. Common Tasks

### Add a new course

1. Add the variant object to `src/data/courses.json` (follow existing structure)
2. Add its ID to `VALID_COURSE_IDS` in `src/app/api/brochure/[courseId]/route.ts`
3. Run `npm run brochures` to generate its PDF
4. `git add . && git push`

### Hide a course (launch with fewer)

Admin panel → `/admin/courses` → toggle off. No redeploy needed.

### Update course content (curriculum)

1. Edit the `content` object in `src/data/courses.json`
2. `npm run brochures:all` to regenerate PDFs
3. `git add public/brochures/ && git push`

### Set specific batch dates for a course

Admin panel → `/admin/courses/[id]` → paste dates in the Batch Dates textarea (one per line). Dates override the auto-computed schedule.

### Create a discount coupon

Admin panel → `/admin/coupons` → Create. Coupons are single-use, 10% off by default.

### Add a teacher

Admin panel → `/admin/teachers` → Add Teacher. They get login credentials at `/login` and access to `/teacher`.

### Switch Razorpay to live mode

1. Get live Key ID and Secret from Razorpay dashboard
2. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel env vars
3. Redeploy (or trigger a redeploy from Vercel dashboard)

### Regenerate all brochure PDFs

```bash
npm run brochures:all
git add public/brochures/ && git push
```

---

## 13. Codebase Map

```
src/
├── app/
│   ├── (public)/
│   │   ├── courses/page.tsx          Course catalog
│   │   ├── courses/[id]/page.tsx     Course detail
│   │   ├── brochure/[id]/page.tsx    Lead capture + brochure download
│   │   ├── enroll/page.tsx           Enrollment + Razorpay checkout
│   │   └── layout.tsx                Public layout (nav + footer)
│   ├── admin/
│   │   ├── courses/page.tsx          Course list with hidden toggles
│   │   ├── courses/[id]/page.tsx     Course edit form
│   │   ├── enrollments/              Enrollment management
│   │   ├── leads/                    Brochure download leads
│   │   ├── coupons/                  Coupon management
│   │   └── teachers/                 Teacher management
│   ├── api/
│   │   ├── courses/route.ts          GET visible merged course variants
│   │   ├── admin/courses/            PATCH course overrides
│   │   ├── brochure/[id]/route.ts    Lead capture + PDF URL
│   │   ├── brochure-html/[id]/       Dynamic HTML brochure (PDF source)
│   │   ├── payment/create-order/     Create Razorpay order
│   │   ├── payment/verify/           Verify payment + create enrollment
│   │   ├── coupon/validate/          Validate coupon code
│   │   └── admin/seed/               One-time admin account creation
│   └── login/page.tsx                Staff login (NextAuth)
├── components/
│   ├── Footer.tsx                    Site footer (includes "build a site" CTA)
│   ├── Nav.tsx                       Public navigation
│   └── ContentUnlockModal.tsx        Course content unlock flow
├── data/
│   └── courses.json                  39 course variants (source of truth)
├── lib/
│   ├── variants.ts                   CourseVariant type + static helpers
│   ├── courseOverrides.ts            Merge JSON + DB overrides, filter hidden
│   ├── auth.ts                       NextAuth config
│   ├── db.ts                         Prisma client singleton
│   ├── mailer.ts                     Resend email helper
│   └── dates.ts                      getUpcomingDates(scheduleRule) → string[]
├── generated/prisma/                 Auto-generated Prisma client (do not edit)
└── scripts/
    └── generate-brochures.mjs        PDF generation script (Puppeteer)

prisma/
└── schema.prisma                     Database schema (12 models)

public/
└── brochures/                        39 pre-generated PDF brochures
```

---

*Last updated: June 2026 · Qurious Academy · hello@quriousacademy.com*
