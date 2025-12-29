import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { moderateImage } from "@/lib/llmModeration";

const MAX_DATA_URL_LENGTH = 4_300_000;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  let payload: { dataUrl?: string; context?: string };
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const dataUrl = payload.dataUrl ?? "";
  if (!dataUrl.startsWith("data:image/")) {
    return NextResponse.json(
      { ok: false, reason: "invalid_image_format" },
      { status: 400 }
    );
  }

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    return NextResponse.json(
      { ok: false, reason: "image_too_large" },
      { status: 400 }
    );
  }

  const result = await moderateImage(dataUrl, payload.context ?? "upload");
  return NextResponse.json(result);
}
