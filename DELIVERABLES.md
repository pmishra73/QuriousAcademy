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

## Pending / To Do

- [ ] Add GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID to Vercel env vars
- [ ] Set up Google Sheet with Leads and Coupons tabs (headers in row 1)
- [ ] Share Google Sheet with service account email (Editor access)
- [ ] Add more articles to /blog as content grows
- [ ] Add more courses to courses.json as offerings expand
