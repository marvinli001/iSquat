import "server-only";
import { getOssConfig } from "@/lib/oss";

type UploadedPhoto = {
  key: string;
  url: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

export const parseUploadedPhotos = (
  formData: FormData,
  fieldName: string,
  prefix: string,
  limit = 3
) => {
  const raw = formData.getAll(fieldName);
  if (raw.length === 0) {
    return [] as UploadedPhoto[];
  }

  const { publicBaseUrl } = getOssConfig();
  const base = `${publicBaseUrl}/`;

  const parsed: UploadedPhoto[] = [];
  for (const item of raw) {
    if (parsed.length >= limit) {
      break;
    }
    if (typeof item !== "string") {
      continue;
    }
    try {
      const value = JSON.parse(item) as unknown;
      if (!isRecord(value)) {
        continue;
      }
      const key = typeof value.key === "string" ? value.key : "";
      const url = typeof value.url === "string" ? value.url : "";
      if (!key || !url) {
        continue;
      }
      if (!key.startsWith(`${prefix}/`) || !url.startsWith(base)) {
        continue;
      }
      parsed.push({ key, url });
    } catch {
      continue;
    }
  }

  return parsed;
};

export type { UploadedPhoto };
