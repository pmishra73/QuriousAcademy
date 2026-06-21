import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { remark } from "remark";
import remarkHtml from "remark-html";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { body } = await req.json();
  const processed = await remark().use(remarkHtml).process(body ?? "");
  return NextResponse.json({ html: processed.toString() });
}
