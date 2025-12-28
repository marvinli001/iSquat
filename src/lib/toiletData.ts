import "server-only";
import type { Row, Value } from "@libsql/core/api";
import { db } from "@/lib/db";
import {
  defaultReviews,
  districts as mockDistricts,
  reviewsBySlug,
  topRatedToilets as mockTopRatedToilets,
  toilets as mockToilets,
} from "@/lib/mockData";
import type { Review, Toilet } from "@/lib/mockData";

type PendingLocation = {
  id: string;
  name: string;
  district: string;
  submittedBy: string;
  photos: number;
  note: string;
};

type PendingReview = {
  id: string;
  location: string;
  rating: number;
  submittedBy: string;
  photos: number;
  snippet: string;
};

const mockPendingLocations: PendingLocation[] = [
  {
    id: "p1",
    name: "Albert Park Gate WC",
    district: "CBD",
    submittedBy: "Ava",
    photos: 2,
    note: "Access code after 6pm. Entry near the east gate.",
  },
  {
    id: "p2",
    name: "Point Chevalier Foreshore WC",
    district: "West",
    submittedBy: "Liam",
    photos: 1,
    note: "Signage is small. Best landmark is the lifeguard hut.",
  },
  {
    id: "p3",
    name: "Sylvia Park Upper Level WC",
    district: "East",
    submittedBy: "Mia",
    photos: 3,
    note: "Located behind the food court elevators.",
  },
];

const mockPendingReviews: PendingReview[] = [
  {
    id: "r1",
    location: "Wynyard Wharf Restrooms",
    rating: 4.6,
    submittedBy: "Noah",
    photos: 2,
    snippet: "Clean floors, fresh scent, and short line.",
  },
  {
    id: "r2",
    location: "Aotea Square Facilities",
    rating: 4.2,
    submittedBy: "Harper",
    photos: 1,
    snippet: "Crowded after events but staff restock quickly.",
  },
  {
    id: "r3",
    location: "Takapuna Beach Pavilion",
    rating: 4.9,
    submittedBy: "Theo",
    photos: 3,
    snippet: "Showers are spotless. Great for beach days.",
  },
];

const tones = [
  "sunset",
  "mango",
  "citrus",
  "apricot",
  "coral",
  "sherbet",
  "amber",
  "rose",
  "fire",
  "lava",
];

const defaultReference = {
  lat: -36.8485,
  lng: 174.7633,
};

const dataSource = (process.env.ISQUAT_DATA_SOURCE ?? "").toLowerCase();
const isDatabaseMode =
  dataSource.length > 0
    ? ["database", "db", "1", "true", "yes"].includes(dataSource)
    : process.env.NODE_ENV === "production";

export { isDatabaseMode };
export type { PendingLocation, PendingReview };

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const formatDistance = (kmValue: number) => {
  if (!Number.isFinite(kmValue)) {
    return "n/a";
  }
  const meters = kmValue * 1000;
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  if (kmValue < 10) {
    return `${kmValue.toFixed(1)} km`;
  }
  return `${Math.round(kmValue)} km`;
};

const toStringValue = (value: Value | null | undefined) => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return null;
};

const toNumberValue = (value: Value | null | undefined) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickTone = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % tones.length;
  return tones[index];
};

const parseTags = (value: Value | null | undefined) => {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const buildToilet = (row: Row): Toilet | null => {
  const id = toStringValue(row.id);
  const slug = toStringValue(row.slug);
  const name = toStringValue(row.name);
  const district = toStringValue(row.district);
  const address = toStringValue(row.address);
  const lat = toNumberValue(row.lat);
  const lng = toNumberValue(row.lng);

  if (!id || !slug || !name || !district || !address) {
    return null;
  }

  const rating = toNumberValue(row.rating) ?? 0;
  const reviewCount = toNumberValue(row.review_count) ?? 0;
  const accessNotes =
    toStringValue(row.access_notes) ?? "No access notes provided.";
  const tags = parseTags(row.tags);
  const tone = pickTone(slug);
  const distance =
    lat !== null && lng !== null
      ? formatDistance(distanceKm(defaultReference.lat, defaultReference.lng, lat, lng))
      : "n/a";

  if (lat === null || lng === null) {
    return null;
  }

  return {
    id,
    slug,
    name,
    district,
    address,
    lat,
    lng,
    rating,
    reviewCount,
    distance,
    tags,
    accessNotes,
    tone,
  };
};

const isToilet = (value: Toilet | null): value is Toilet => Boolean(value);

const queryToilets = async (sql: string, args: Array<string | number>) => {
  const result = await db.execute({ sql, args });
  return result.rows.map(buildToilet).filter(isToilet);
};

const formatReviewDate = (value: string | null) => {
  if (!value) {
    return "Recently";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }
  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  const weeks = Math.floor(diffDays / 7);
  if (weeks < 5) {
    return `${weeks} weeks ago`;
  }
  return parsed.toLocaleDateString("en-NZ", {
    month: "short",
    day: "numeric",
  });
};

const buildReview = (row: Row): Review | null => {
  const id = toStringValue(row.id);
  const rating = toNumberValue(row.rating);
  if (!id || rating === null) {
    return null;
  }

  const userName = toStringValue(row.user_name);
  const email = toStringValue(row.user_email);
  const fallbackName = email ? email.split("@")[0] : "Anonymous";
  const name = userName && userName.trim().length > 0 ? userName : fallbackName;
  const body = toStringValue(row.body) ?? "";
  const date = formatReviewDate(toStringValue(row.created_at));

  return { id, name, rating, date, body };
};

const isReview = (value: Review | null): value is Review => Boolean(value);

const buildSnippet = (value: string | null) => {
  if (!value || value.trim().length === 0) {
    return "No review notes yet.";
  }
  const trimmed = value.trim();
  if (trimmed.length <= 90) {
    return trimmed;
  }
  return `${trimmed.slice(0, 87)}...`;
};

const buildName = (value: string | null, email: string | null) => {
  if (value && value.trim().length > 0) {
    return value;
  }
  if (email && email.trim().length > 0) {
    return email;
  }
  return "Anonymous";
};

export async function getDistricts() {
  if (!isDatabaseMode) {
    return mockDistricts;
  }

  const result = await db.execute({
    sql: "SELECT name FROM districts ORDER BY name",
    args: [],
  });

  return result.rows
    .map((row) => toStringValue(row.name))
    .filter((name): name is string => Boolean(name));
}

export async function getToilets() {
  if (!isDatabaseMode) {
    return mockToilets;
  }

  return queryToilets(
    `
      SELECT
        t.id,
        t.slug,
        t.name,
        d.name AS district,
        t.address,
        t.lat,
        t.lng,
        t.access_notes AS access_notes,
        t.avg_rating AS rating,
        t.review_count AS review_count,
        GROUP_CONCAT(tags.name, '|') AS tags
      FROM toilets t
      JOIN districts d ON d.id = t.district_id
      LEFT JOIN toilet_tags tt ON tt.toilet_id = t.id
      LEFT JOIN tags ON tags.id = tt.tag_id
      WHERE t.status = 'approved'
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `,
    []
  );
}

export async function getTopRatedToilets(limit = 10) {
  if (!isDatabaseMode) {
    return mockTopRatedToilets.slice(0, limit);
  }

  return queryToilets(
    `
      SELECT
        t.id,
        t.slug,
        t.name,
        d.name AS district,
        t.address,
        t.lat,
        t.lng,
        t.access_notes AS access_notes,
        t.avg_rating AS rating,
        t.review_count AS review_count,
        GROUP_CONCAT(tags.name, '|') AS tags
      FROM toilets t
      JOIN districts d ON d.id = t.district_id
      LEFT JOIN toilet_tags tt ON tt.toilet_id = t.id
      LEFT JOIN tags ON tags.id = tt.tag_id
      WHERE t.status = 'approved'
      GROUP BY t.id
      ORDER BY t.avg_rating DESC, t.review_count DESC
      LIMIT ?
    `,
    [limit]
  );
}

export async function getToiletById(idOrSlug: string) {
  if (!isDatabaseMode) {
    return (
      mockToilets.find(
        (item) => item.id === idOrSlug || item.slug === idOrSlug
      ) ?? null
    );
  }

  const rows = await queryToilets(
    `
      SELECT
        t.id,
        t.slug,
        t.name,
        d.name AS district,
        t.address,
        t.lat,
        t.lng,
        t.access_notes AS access_notes,
        t.avg_rating AS rating,
        t.review_count AS review_count,
        GROUP_CONCAT(tags.name, '|') AS tags
      FROM toilets t
      JOIN districts d ON d.id = t.district_id
      LEFT JOIN toilet_tags tt ON tt.toilet_id = t.id
      LEFT JOIN tags ON tags.id = tt.tag_id
      WHERE t.status = 'approved' AND (t.id = ? OR t.slug = ?)
      GROUP BY t.id
      LIMIT 1
    `,
    [idOrSlug, idOrSlug]
  );

  return rows[0] ?? null;
}

export async function getNearbyToilets(toilet: Toilet, limit = 3) {
  if (!isDatabaseMode) {
    return mockToilets
      .filter((item) => item.slug !== toilet.slug)
      .slice(0, limit);
  }

  return queryToilets(
    `
      SELECT
        t.id,
        t.slug,
        t.name,
        d.name AS district,
        t.address,
        t.lat,
        t.lng,
        t.access_notes AS access_notes,
        t.avg_rating AS rating,
        t.review_count AS review_count,
        GROUP_CONCAT(tags.name, '|') AS tags
      FROM toilets t
      JOIN districts d ON d.id = t.district_id
      LEFT JOIN toilet_tags tt ON tt.toilet_id = t.id
      LEFT JOIN tags ON tags.id = tt.tag_id
      WHERE t.status = 'approved' AND t.id <> ?
      GROUP BY t.id
      ORDER BY ((t.lat - ?) * (t.lat - ?) + (t.lng - ?) * (t.lng - ?)) ASC
      LIMIT ?
    `,
    [toilet.id, toilet.lat, toilet.lat, toilet.lng, toilet.lng, limit]
  );
}

export async function getReviewsForToilet(toiletId: string, slug: string) {
  if (!isDatabaseMode) {
    return reviewsBySlug[slug] ?? defaultReviews;
  }

  const result = await db.execute({
    sql: `
      SELECT
        r.id,
        r.rating,
        r.body,
        r.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.toilet_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 20
    `,
    args: [toiletId],
  });

  return result.rows.map(buildReview).filter(isReview);
}

export async function getPendingLocations() {
  if (!isDatabaseMode) {
    return mockPendingLocations;
  }

  const result = await db.execute({
    sql: `
      SELECT
        s.id,
        s.name,
        d.name AS district,
        s.access_notes AS note,
        COALESCE(u.name, u.email) AS submitted_by,
        0 AS photos
      FROM toilet_submissions s
      JOIN districts d ON d.id = s.district_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.status = 'pending'
      ORDER BY s.created_at DESC
      LIMIT 20
    `,
    args: [],
  });

  return result.rows
    .map((row) => {
      const id = toStringValue(row.id);
      const name = toStringValue(row.name);
      const district = toStringValue(row.district);
      const submittedBy = buildName(
        toStringValue(row.submitted_by),
        null
      );
      const photos = toNumberValue(row.photos) ?? 0;
      const note = toStringValue(row.note) ?? "No access notes provided.";

      if (!id || !name || !district) {
        return null;
      }

      return { id, name, district, submittedBy, photos, note };
    })
    .filter((value): value is PendingLocation => Boolean(value));
}

export async function getPendingReviews() {
  if (!isDatabaseMode) {
    return mockPendingReviews;
  }

  const result = await db.execute({
    sql: `
      SELECT
        r.id,
        t.name AS location,
        r.rating,
        r.body,
        COALESCE(u.name, u.email) AS submitted_by,
        (SELECT COUNT(*) FROM review_photos rp WHERE rp.review_id = r.id) AS photos
      FROM reviews r
      JOIN toilets t ON t.id = r.toilet_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 20
    `,
    args: [],
  });

  return result.rows
    .map((row) => {
      const id = toStringValue(row.id);
      const location = toStringValue(row.location);
      const rating = toNumberValue(row.rating);
      const submittedBy = buildName(
        toStringValue(row.submitted_by),
        null
      );
      const photos = toNumberValue(row.photos) ?? 0;
      const snippet = buildSnippet(toStringValue(row.body));

      if (!id || !location || rating === null) {
        return null;
      }

      return { id, location, rating, submittedBy, photos, snippet };
    })
    .filter((value): value is PendingReview => Boolean(value));
}
