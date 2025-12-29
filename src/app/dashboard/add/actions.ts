"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseUploadedPhotos, type UploadedPhoto } from "@/lib/photoUploads";
import { isDatabaseMode } from "@/lib/toiletData";

type FormState = {
  error?: string;
};

const toString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDistrictId = async (district: string) => {
  const result = await db.execute({
    sql: `
      SELECT id
      FROM districts
      WHERE name = ? OR slug = ?
      LIMIT 1
    `,
    args: [district, slugify(district)],
  });
  const row = result.rows[0];
  return typeof row?.id === "string" ? row.id : null;
};

export async function submitToilet(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to submit a location." };
  }

  const name = toString(formData.get("name"));
  const address = toString(formData.get("address"));
  const district = toString(formData.get("district"));
  const notes = toString(formData.get("notes"));
  const lat = toNumber(toString(formData.get("lat")));
  const lng = toNumber(toString(formData.get("lng")));

  if (!name || !address || !district) {
    return { error: "Name, address, and district are required." };
  }

  if (lat === null || lng === null) {
    return { error: "Please drop a pin on the map." };
  }

  if (!isDatabaseMode) {
    redirect("/dashboard");
  }

  const districtId = await getDistrictId(district);
  if (!districtId) {
    return { error: "District not found. Choose one from the list." };
  }

  const toiletId = crypto.randomUUID();
  const slugBase = slugify(name) || "toilet";
  const slug = `${slugBase}-${toiletId.slice(0, 6)}`;

  await db.execute({
    sql: `
      INSERT INTO toilets (
        id,
        slug,
        name,
        district_id,
        address,
        lat,
        lng,
        access_notes,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'hidden', ?)
    `,
    args: [
      toiletId,
      slug,
      name,
      districtId,
      address,
      lat,
      lng,
      notes || null,
      user.id,
    ],
  });

  const submissionId = crypto.randomUUID();
  await db.execute({
    sql: `
      INSERT INTO toilet_submissions (
        id,
        user_id,
        name,
        district_id,
        address,
        lat,
        lng,
        access_notes,
        status,
        resolved_toilet_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `,
    args: [
      submissionId,
      user.id,
      name,
      districtId,
      address,
      lat,
      lng,
      notes || null,
      toiletId,
    ],
  });

  let photos: UploadedPhoto[] = [];
  try {
    photos = parseUploadedPhotos(formData, "photos", "toilets");
  } catch {
    return { error: "Photo uploads are not configured." };
  }
  for (const photo of photos) {
    await db.execute({
      sql: `
        INSERT INTO toilet_photos (
          id,
          toilet_id,
          uploaded_by,
          storage_key,
          url,
          status
        )
        VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      args: [
        crypto.randomUUID(),
        toiletId,
        user.id,
        photo.key,
        photo.url,
      ],
    });
  }

  redirect("/dashboard");
}
