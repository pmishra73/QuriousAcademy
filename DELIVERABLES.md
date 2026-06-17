# Qurious Academy — Deliverables

## Setup & Infrastructure

- [x] Brand rename: Qubit → Qurious Academy everywhere (UI, emails, API routes)
- [x] Email updated to hello@quriousacademy.com
- [x] GitHub repo created and connected to Vercel auto-deploy
- [x] DNS configured: A record → 76.76.21.21, CNAME www → cname.vercel-dns.com
- [x] SVG favicon matching the Q nav logo

## Courses Page

- [x] Sticky Subject + Class Type filters
- [x] All 5 course formats in the Type filter: MasterClass · Cohort · Deep Dive · Sprint · Full Course
- [x] Hover tooltip on each type pill explaining what the format is
- [x] Format guide legend at the bottom of the page
- [x] 13 courses in courses.json, all taught by Prasant Mishra
- [x] Lucide icons used throughout (no emojis)

## About Page

- [x] Removed placeholder team grid and stats
- [x] Founder card with photo (founder.png), credential tags, and "View profile" linking to pmishra73.github.io
- [x] Credentials: GenAI Solutions Architect · Programmer & Solutions Architect · 2500+ Students Taught · 15+ Yrs Teaching Experience · 60+ Projects Delivered

## Home Page

- [x] Removed placeholder stats bar
- [x] Removed placeholder testimonials section

## Resources / Blog

- [x] 6 full-length articles written by Prasant Mishra (markdown files)
- [x] Markdown pipeline: gray-matter + remark for frontmatter and HTML rendering
- [x] /blog listing page with sticky topic filter (Programming · Mathematics · AI & ML · Science · Technology)
- [x] /blog/[slug] article pages — statically generated, with prose styling and a Browse Courses CTA

## Typography

- [x] Heading font: Source Serif 4 (same as Medium) — open letterforms, good word spacing

## Lead Capture & Coupon System

- [x] Course content unlock saves lead (name, email, phone, course) to Google Sheets → Leads tab
- [x] Unique coupon code (QA-XXXXXX) generated on each unlock
- [x] Coupon saved to Google Sheets → Coupons tab with status "unused"
- [x] Coupon emailed to student with a 10% off message and enroll link
- [x] Coupon shown in the modal after unlock with a "Copy code" button
- [x] /api/coupon/validate: checks code exists and is unused
- [x] Coupons are single-use — marked "used" in Sheets after payment verified
- [x] Enroll page: coupon field with live Apply validation, discounted total shown in green
- [x] Payment create-order: applies 10% to Razorpay order amount if valid coupon
- [x] Payment verify: marks coupon used, includes discount detail in confirmation emails

## DB + Auth + Admin Panel + Teacher Panel

- [x] Prisma 7 schema: User, CourseAssignment, Enrollment, Lead, Coupon, Session, Attendance, StudentNote, Resource, Announcement, Message
- [x] Coupon table: reason (syllabus_unlock / course_completion / promotional), single-use enforced at DB layer (status + usedByEnrollmentId FK)
- [x] NextAuth v5 credentials login with role-based JWT (admin / teacher)
- [x] /login page — clean, themed, handles unauthorized error
- [x] proxy.ts route guard: /admin/* requires admin role, /teacher/* requires teacher or admin
- [x] Admin layout + sidebar nav (Dashboard, Enrollments, Leads & Coupons, Courses, Teachers, Messages, Content)
- [x] Admin dashboard: KPI cards (enrollments, revenue, leads, coupons redeemed, unread messages, upcoming sessions) + recent enrollments table
- [x] Admin enrollments page: full table with coupon, discount, status
- [x] Admin leads & coupons page: leads table + full coupon table with reason/status/used-at
- [x] Admin: Generate Promotional Coupon modal (posts to /api/admin/coupons/generate)
- [x] Admin messages page: contact + teach-with-us enquiries, mark as read
- [x] Admin teachers page: teacher cards, active/inactive badge, Add Teacher link
- [x] Teacher layout + sidebar nav (My Courses, Sessions, Students, Resources, Announcements, Profile) — green accent
- [x] Teacher dashboard: assigned courses with enrollment count + upcoming sessions
- [x] Coupon logic migrated from Google Sheets → Postgres DB (unlock-content, coupon/validate, payment/verify)
- [x] /api/admin/seed: one-time endpoint to create first admin account (protected by SEED_SECRET env var)
- [x] @prisma/adapter-pg driver adapter for Prisma 7 Postgres connection

## Pending / To Do

- [ ] **Deploy DB**: Add Neon Postgres via Vercel Marketplace → get DATABASE_URL
- [ ] **Seed admin**: POST /api/admin/seed with SEED_SECRET + credentials to create first admin
- [ ] Add SEED_SECRET, NEXTAUTH_SECRET env vars to Vercel
- [ ] Complete admin: course management UI (add/edit courses, assign teachers)
- [ ] Complete teacher panel: students roster + attendance marking, resources upload, announcements send
- [ ] Teacher panel: Mark Complete → auto-generate + email course-completion coupon
- [ ] Add more articles to /blog as content grows
- [ ] Add more courses to courses.json as offerings expand
