PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS toilets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  access_notes TEXT,
  avg_rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'hidden')),
  created_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_toilets_district_id ON toilets(district_id);
CREATE INDEX IF NOT EXISTS idx_toilets_rating ON toilets(avg_rating);

CREATE TABLE IF NOT EXISTS toilet_tags (
  toilet_id TEXT NOT NULL REFERENCES toilets(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (toilet_id, tag_id)
);

CREATE TABLE IF NOT EXISTS toilet_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  access_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  review_notes TEXT,
  resolved_toilet_id TEXT REFERENCES toilets(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_toilet_submissions_status ON toilet_submissions(status);

CREATE TABLE IF NOT EXISTS toilet_photos (
  id TEXT PRIMARY KEY,
  toilet_id TEXT NOT NULL REFERENCES toilets(id) ON DELETE CASCADE,
  uploaded_by TEXT REFERENCES users(id),
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_toilet_photos_toilet_id ON toilet_photos(toilet_id);
CREATE INDEX IF NOT EXISTS idx_toilet_photos_status ON toilet_photos(status);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  toilet_id TEXT NOT NULL REFERENCES toilets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_toilet_status ON reviews(toilet_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE TABLE IF NOT EXISTS review_photos (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  toilet_id TEXT NOT NULL REFERENCES toilets(id) ON DELETE CASCADE,
  uploaded_by TEXT REFERENCES users(id),
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT REFERENCES users(id),
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_status ON review_photos(status);
