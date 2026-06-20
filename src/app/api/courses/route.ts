import { NextResponse } from "next/server";
import { getVisibleVariants } from "@/lib/courseOverrides";

export async function GET() {
  const variants = await getVisibleVariants();
  return NextResponse.json(variants);
}
