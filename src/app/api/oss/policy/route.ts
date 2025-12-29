import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildOssObjectUrl, createOssPolicy, getOssConfig } from "@/lib/oss";

const allowedContentTypes = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const getExtension = (contentType: string, filename: string) => {
  const mapped = allowedContentTypes.get(contentType);
  if (mapped) {
    return mapped;
  }

  const parts = filename.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }

  return "jpg";
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: { prefix?: string; filename?: string; contentType?: string };
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const prefix = payload.prefix === "reviews" ? "reviews" : "toilets";
  const filename = payload.filename ?? "upload.jpg";
  const contentType = payload.contentType ?? "";

  if (!allowedContentTypes.has(contentType)) {
    return NextResponse.json(
      { error: "unsupported_file_type" },
      { status: 400 }
    );
  }

  try {
    getOssConfig();
  } catch (error) {
    return NextResponse.json(
      { error: "oss_not_configured" },
      { status: 500 }
    );
  }

  const extension = getExtension(contentType, filename);
  const key = `${prefix}/${user.id}/${crypto.randomUUID()}.${extension}`;
  const policy = createOssPolicy({
    key,
    contentTypePrefix: "image/",
  });

  return NextResponse.json({
    host: policy.host,
    accessKeyId: policy.accessKeyId,
    policy: policy.policy,
    signature: policy.signature,
    expire: policy.expire,
    maxBytes: policy.maxBytes,
    key,
    url: buildOssObjectUrl(key),
  });
}
