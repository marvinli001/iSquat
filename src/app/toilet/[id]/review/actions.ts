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

const toRating = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 5) {
    return null;
  }
  return rounded;
};

export async function submitReview(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to add a review." };
  }

  const toiletId = toString(formData.get("toiletId"));
  const rating = toRating(toString(formData.get("rating")));
  const body = toString(formData.get("body"));

  if (!toiletId || rating === null) {
    return { error: "Rating is required." };
  }

  if (!isDatabaseMode) {
    redirect(`/toilet/${toiletId}`);
  }

  const toiletLookup = await db.execute({
    sql: "SELECT id FROM toilets WHERE id = ? LIMIT 1",
    args: [toiletId],
  });
  if (!toiletLookup.rows[0]) {
    return { error: "Toilet not found." };
  }

  const reviewId = crypto.randomUUID();
  await db.execute({
    sql: `
      INSERT INTO reviews (
        id,
        toilet_id,
        user_id,
        rating,
        body,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'pending')
    `,
    args: [reviewId, toiletId, user.id, rating, body || null],
  });

  let photos: UploadedPhoto[] = [];
  try {
    photos = parseUploadedPhotos(formData, "photos", "reviews");
  } catch {
    return { error: "Photo uploads are not configured." };
  }
  for (const photo of photos) {
    await db.execute({
      sql: `
        INSERT INTO review_photos (
          id,
          review_id,
          toilet_id,
          uploaded_by,
          storage_key,
          url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      args: [
        crypto.randomUUID(),
        reviewId,
        toiletId,
        user.id,
        photo.key,
        photo.url,
      ],
    });
  }

  redirect(`/toilet/${toiletId}`);
}
