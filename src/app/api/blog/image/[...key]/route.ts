import { NextRequest, NextResponse } from "next/server";
import { getBlogImage } from "@/lib/blog-r2";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { key } = await params;
  const imageKey = key.join("/");

  const result = await getBlogImage(imageKey);
  if (!result) return new NextResponse(null, { status: 404 });

  const body = await result.stream.transformToByteArray();

  return new NextResponse(body, {
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
