# LinkedIn Integration — Current State & Path to Automated Posting

This describes how the blog → LinkedIn pipeline works today, and what's needed to
upgrade it to fully automated posting later.

## How it works right now (manual posting — always available)

1. A teacher checks "Request LinkedIn post" when saving a blog post.
2. It shows up as **pending** in `/admin/blogs` (list) and the post's detail page.
3. Admin clicks **Approve** or **Reject**.
4. Once approved, admin clicks **"Copy post text"** — this copies a ready-made
   caption (title + excerpt + a link back to the blog post) to the clipboard.
5. Admin pastes it into a new post on the Qurious Academy LinkedIn Company Page
   themselves, the normal way (linkedin.com → your Page → Start a post).
6. Admin clicks **"Mark as posted"** so the post shows as done in the dashboard.

No LinkedIn API access, no developer account, no approval process, no cost —
this works today and requires nothing further.

## What "automated posting" (Option B) would add

Once connected, the *same* "Approve" step would show a **"Post to LinkedIn"**
button instead of "Copy post text" — it calls LinkedIn's API directly and the
post goes live without you touching linkedin.com. All the code for this is
already built and dormant (`src/lib/linkedin.ts`,
`/api/admin/linkedin/oauth/{start,callback}`, `/api/admin/linkedin/publish`,
`/admin/settings/linkedin`) — it activates automatically the moment a LinkedIn
account is connected under Admin → Settings → LinkedIn. No further code changes
needed on our end once access is granted.

## What's required to get there

LinkedIn doesn't charge money for this — the "cost" is entirely LinkedIn's own
approval process, which is separate from money. Rough steps (verify current
specifics at [developer.linkedin.com](https://developer.linkedin.com) before
applying, since LinkedIn's process does change over time):

### 1. Prerequisites (before applying)

- A **LinkedIn Company Page already exists** for Qurious Academy, and you're a
  **super admin** of that Page.
- A **business email address** (not a personal Gmail-style address) that you
  can receive verification mail at, and that LinkedIn can associate with the
  organization.
- Your organization's **legal name, registered address, website, and a privacy
  policy URL**. (`quriousacademy.com` needs a `/privacy` page if it doesn't
  already have one.)
- The Community Management API is only granted to **registered legal
  organizations for commercial use cases** — a sole-proprietor/unregistered
  setup may need to be formalized first.

### 2. Create the developer app

1. Go to [linkedin.com/developers/apps/new](https://www.linkedin.com/developers/apps/new).
2. Create an app, associate it with the Qurious Academy Company Page (this
   triggers a verification step — a super admin of the Page has to approve the
   app association from inside LinkedIn).
3. Under the app's **Auth** tab, note the **Client ID** and **Client Secret** —
   these become the `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` env vars
   already referenced throughout this codebase (see `DOCS.md`).
4. Add the **redirect URL** `https://www.quriousacademy.com/api/admin/linkedin/oauth/callback`
   under the Auth tab (this already matches what `src/lib/linkedin.ts` sends).

### 3. Apply for Community Management API — Development tier

1. In the app's **Products** tab, request the **Community Management API**
   product.
2. Fill out the access request form: business email, org legal name/address/
   website/privacy policy, and your use case (something like: *"Automatically
   publish blog articles from our education platform to our Company Page, with
   human review/approval before each post."*).
3. LinkedIn reviews for: approved use case, verified business email, verified
   organization, verified org website/domain, and Page-admin verification of
   the app.
4. If approved, you get **Development tier** — functional but rate-limited
   (roughly 500 calls/app/day, 100/member/day at time of writing), good enough
   for testing the full flow end-to-end.

### 4. Upgrade to Standard tier (removes rate limits, required for real use)

1. Fully integrate and test the Development tier access first (this codebase
   already does — connect via `/admin/settings/linkedin`, approve + post one
   real test article).
2. Submit the **Standard tier** access form, including a **screen recording**
   (under 5 minutes) demonstrating: the OAuth consent flow, and an admin
   approving + posting an article to the Page via this app.
3. You must upgrade to Standard tier within **12 months** of Development tier
   approval, or LinkedIn revokes access for inactivity.

### 5. Connect it in this app

Once Standard tier is approved:

1. Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` in Vercel's
   environment variables (Production + Preview).
2. As an admin, go to `/admin/settings/linkedin` → **Connect LinkedIn** →
   authorize.
3. Enter the **Organization URN** (`urn:li:organization:XXXXXXXX` — found via
   your LinkedIn Page's admin tools or the Organizations API).
4. Done — the "Post to LinkedIn" button now appears in place of "Copy post
   text" for approved posts, and posts go live via the API immediately when
   clicked.

## Required OAuth scopes (for reference)

The code currently requests `w_organization_social r_organization_social` for
the org-posting flow. LinkedIn has periodically renamed/split these scopes
(e.g. `w_organization_social` → `w_organization_social_feed` in a past
migration) — if the OAuth authorize step errors on scope, check the current
scope names for the Community Management API in LinkedIn's docs and update the
`ORG_POST_SCOPES` constant in `src/lib/linkedin.ts` accordingly.

## Summary

| | Option C (now) | Option B (later) |
|---|---|---|
| Cost | Free | Free |
| Setup time | None | Weeks–months (LinkedIn's approval process) |
| Posts as | Qurious Academy Page (you paste it) | Qurious Academy Page (API posts it) |
| Manual step per post | Copy + paste on LinkedIn | None |
| Code required | Already built and live | Already built, just needs credentials |
