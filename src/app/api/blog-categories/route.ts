import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Seed defaults on first fetch if the table is empty
const DEFAULTS = [
  "General", "Programming", "Mathematics", "AI & ML",
  "Science", "Technology", "Data Structures", "Interview Prep", "Career",
];

export type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryNode[];
};

export async function GET() {
  const count = await db.blogCategory.count();
  if (count === 0) {
    await db.blogCategory.createMany({
      data: DEFAULTS.map((name) => ({ name, parentId: null })),
      skipDuplicates: true,
    });
  }

  const rows = await db.blogCategory.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  // Build tree: top-level with children nested
  const byId = new Map<string, CategoryNode>();
  for (const r of rows) {
    byId.set(r.id, { id: r.id, name: r.name, parentId: r.parentId, children: [] });
  }
  const tree: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return NextResponse.json(tree);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "admin" && role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, parentId } = await req.json();
  const trimmed = name?.trim();
  if (!trimmed) return NextResponse.json({ error: "name is required" }, { status: 400 });

  // Validate parentId refers to a top-level category (no nested sub-sub-categories)
  if (parentId) {
    const parent = await db.blogCategory.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
    if (parent.parentId) return NextResponse.json({ error: "Cannot nest more than one level deep" }, { status: 400 });
  }

  try {
    const cat = await db.blogCategory.create({
      data: { name: trimmed, parentId: parentId ?? null },
    });
    return NextResponse.json(cat, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 });
  }
}
