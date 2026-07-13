export type OAuthProfile = { email: string; name?: string; picture?: string };

type ProviderConfig = {
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  buildAuthorizeUrl: (state: string, redirectUri: string) => string;
  exchangeCode: (code: string, redirectUri: string) => Promise<{ access_token: string }>;
  fetchProfile: (accessToken: string) => Promise<OAuthProfile>;
};

const providers: Record<string, ProviderConfig> = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    buildAuthorizeUrl: (state, redirectUri) =>
      `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
      })}`,
    exchangeCode: async (code, redirectUri) => {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID ?? "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
      return res.json();
    },
    fetchProfile: async (accessToken) => {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch Google profile");
      const data = await res.json();
      return { email: data.email, name: data.name, picture: data.picture };
    },
  },

  github: {
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    buildAuthorizeUrl: (state, redirectUri) =>
      `https://github.com/login/oauth/authorize?${new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID ?? "",
        redirect_uri: redirectUri,
        scope: "read:user user:email",
        state,
      })}`,
    exchangeCode: async (code, redirectUri) => {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GITHUB_CLIENT_ID ?? "",
          client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
          redirect_uri: redirectUri,
        }),
      });
      if (!res.ok) throw new Error(`GitHub token exchange failed: ${await res.text()}`);
      return res.json();
    },
    fetchProfile: async (accessToken) => {
      const headers = { Authorization: `Bearer ${accessToken}`, "User-Agent": "quriousacademy" };
      const userRes = await fetch("https://api.github.com/user", { headers });
      if (!userRes.ok) throw new Error("Failed to fetch GitHub profile");
      const user = await userRes.json();
      let email: string | undefined = user.email ?? undefined;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
        if (emailsRes.ok) {
          const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
          email = emails.find((e) => e.primary && e.verified)?.email ?? emails.find((e) => e.verified)?.email;
        }
      }
      if (!email) throw new Error("GitHub account has no accessible email");
      return { email, name: user.name ?? user.login, picture: user.avatar_url };
    },
  },

  linkedin: {
    clientId: () => process.env.LINKEDIN_CLIENT_ID,
    clientSecret: () => process.env.LINKEDIN_CLIENT_SECRET,
    buildAuthorizeUrl: (state, redirectUri) =>
      `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
        response_type: "code",
        client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
        redirect_uri: redirectUri,
        scope: "openid profile email",
        state,
      })}`,
    exchangeCode: async (code, redirectUri) => {
      const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
          client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
        }),
      });
      if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${await res.text()}`);
      return res.json();
    },
    fetchProfile: async (accessToken) => {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch LinkedIn profile");
      const data = await res.json();
      return { email: data.email, name: data.name, picture: data.picture };
    },
  },
};

export function getProvider(name: string): ProviderConfig | null {
  return providers[name] ?? null;
}

export function isProviderConfigured(name: string): boolean {
  const p = providers[name];
  return !!(p && p.clientId() && p.clientSecret());
}

export const STUDENT_OAUTH_PROVIDER_NAMES = Object.keys(providers);
