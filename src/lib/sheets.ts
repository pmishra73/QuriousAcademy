import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function sheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

// ── Leads ────────────────────────────────────────────────────────────────────

export async function appendLead({
  name, email, phone, courseId, courseTitle, couponCode,
}: { name: string; email: string; phone: string; courseId: string; courseTitle: string; couponCode: string }) {
  await sheets().spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Leads!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        name, email, phone, courseTitle, courseId, couponCode,
      ]],
    },
  });
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `QA-${rand}`;
}

export async function saveCoupon({
  code, email, phone, courseId,
}: { code: string; email: string; phone: string; courseId: string }) {
  await sheets().spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Coupons!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        code, email, phone, courseId,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        "unused",
      ]],
    },
  });
}

export async function validateCoupon(code: string): Promise<{
  valid: boolean; email?: string; phone?: string; reason?: string;
}> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Coupons!A:F",
  });
  const rows = res.data.values ?? [];
  // Skip header row (row 0 if it exists and first cell isn't a code)
  const row = rows.find((r) => r[0] === code);
  if (!row) return { valid: false, reason: "Coupon not found" };
  if (row[5] === "used") return { valid: false, reason: "This coupon has already been used" };
  return { valid: true, email: row[1], phone: row[2] };
}

export async function markCouponUsed(code: string) {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Coupons!A:F",
  });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === code);
  if (rowIndex === -1) return;
  await sheets().spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Coupons!F${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["used"]] },
  });
}
