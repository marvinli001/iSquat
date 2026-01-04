# iSquat

iSquat is an Auckland-focused public toilet rating and location web app. Visitors can browse top-rated and latest locations, use geolocation to find nearby toilets, and sign in to submit missing locations, reviews, and photos. Admins review submissions before anything appears publicly.

## Features

- Auckland-wide toilet listings with latest and top 10 rankings
- Browser geolocation for nearest-to-farthest sorting
- Detail pages with map preview, facility tags, photos, and reviews
- Signed-in users can submit missing locations, reviews, and photos
- Admin console for pending location and review queues
- PWA support with an offline fallback page in production

## Pages and routes

- `/` home with top rated module
- `/nearby` nearby toilets sorted by distance
- `/latest` latest additions, filterable by district
- `/top` top 10 ranked list
- `/toilet/[id]` toilet detail
- `/toilet/[id]/review` submit review and photos (signed-in only)
- `/dashboard` member dashboard
- `/dashboard/add` submit a missing location
- `/admin` admin console

## APIs

- `POST /api/oss/policy` create an OSS upload policy (signed-in only)
- `POST /api/moderate-image` image moderation (signed-in only)

## Tech stack

- Next.js App Router, React 19
- Tailwind CSS 4 (via PostCSS)
- Turso libsql database and sessions
- Leaflet + OpenStreetMap maps
- Service worker and web app manifest
- bcryptjs for password hashing

## Local development

1. Copy `.env.example` to `.env.local` and fill in values
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the dev server
   ```bash
   npm run dev
   ```

Common scripts:

```bash
npm run build
npm run start
npm run lint
```

## Environment variables

Copy `.env.example` to `.env.local` and set as needed:

| Variable | Description |
| --- | --- |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `TURSO_DATABASE_AUTH_TOKEN` | Alternate Turso auth token env name |
| `TURSO_DEV_STUB` | Use stub in dev, `0` forces real database |
| `SESSION_SECRET` | Session signing secret, required for real DB |
| `ADMIN_EMAILS` | Comma-separated admin emails, grants admin role on sign-up |
| `ISQUAT_DATA_SOURCE` | Data mode, `mock` or `database` |
| `OSS_ACCESS_KEY_ID` | OSS access key |
| `OSS_ACCESS_KEY_SECRET` | OSS secret |
| `OSS_BUCKET` | OSS bucket |
| `OSS_REGION` | OSS region, optional |
| `OSS_ENDPOINT` | OSS endpoint |
| `OSS_PUBLIC_BASE_URL` | Public OSS base URL, optional |
| `LLM_API_BASE_URL` | Image moderation API base URL (OpenAI compatible) |
| `LLM_API_KEY` | Image moderation API key |
| `LLM_MODEL` | Image moderation model |
| `LLM_IMAGE_MODERATION` | Image moderation flag, `0` to disable |

## Data modes

- Default is `ISQUAT_DATA_SOURCE=mock`, which uses `src/lib/mockData.ts`.
- For the real database, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, and set `TURSO_DEV_STUB=0` with `ISQUAT_DATA_SOURCE=database`.
- In production, if `ISQUAT_DATA_SOURCE` is not set, database mode is assumed.
- Database schema lives in `db/schema.sql`.

## Photo uploads and moderation

- Client uploads call `/api/moderate-image` first. If LLM moderation is disabled or unconfigured, it allows the upload.
- `/api/oss/policy` returns direct-to-OSS upload credentials.
- Max 3 photos per submission, 3 MB per image, supports JPG, PNG, WebP, GIF.
- Reviews and photos are inserted as `pending` until admins approve them.

## Admin console

The admin UI currently lists pending locations and reviews. The approve, edit, and reject buttons are UI placeholders and do not persist changes yet. To complete moderation flows, add the corresponding server-side update APIs.

## Project structure

- `src/app` pages and routes
- `src/components` shared components and forms
- `src/lib` data access, auth, uploads, moderation
- `db/schema.sql` database schema
- `public/` PWA assets and offline page
