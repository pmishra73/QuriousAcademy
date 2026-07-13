import { db } from "@/lib/db";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

// Community Management API product — required to post as an organization page.
const ORG_POST_SCOPES = "w_organization_social r_organization_social";

function redirectUri() {
  const base = process.env.NEXTAUTH_URL ?? "https://quriousacademy.com";
  return `${base.replace(/\/$/, "")}/api/admin/linkedin/oauth/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    state,
    scope: ORG_POST_SCOPES,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
    client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; expires_in: number; refresh_token?: string }>;
}

export async function getLinkedInIntegration() {
  return db.linkedInIntegration.findUnique({ where: { id: "singleton" } });
}

export async function isLinkedInConfigured() {
  const integration = await getLinkedInIntegration();
  return !!(integration?.accessToken && integration?.organizationUrn);
}

/** Posts to the connected LinkedIn organization page. Returns the public post URL. */
export async function postToLinkedIn(text: string): Promise<string> {
  const integration = await getLinkedInIntegration();
  if (!integration?.accessToken || !integration.organizationUrn) {
    throw new Error("LinkedIn is not connected — set it up under Admin → Settings → LinkedIn.");
  }

  const res = await fetch(UGC_POSTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      Authorization: `Bearer ${integration.accessToken}`,
    },
    body: JSON.stringify({
      author: integration.organizationUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!res.ok) throw new Error(`LinkedIn post failed (${res.status}): ${await res.text()}`);

  const postId = res.headers.get("x-restli-id") ?? res.headers.get("X-RestLi-Id");
  return postId ? `https://www.linkedin.com/feed/update/${postId}/` : "https://www.linkedin.com/company/";
}

export function buildPostText(title: string, excerpt: string, slug: string): string {
  return `${title}\n\n${excerpt}\n\nRead more: https://quriousacademy.com/blog/${slug}`;
}
