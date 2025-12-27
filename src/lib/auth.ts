import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  status: "active" | "disabled";
};

const SESSION_COOKIE = "isquat_session";
const SESSION_DURATION_DAYS = 7;

const isDev = process.env.NODE_ENV !== "production";
const authToken =
  process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN;
const hasTursoConfig = Boolean(process.env.TURSO_DATABASE_URL && authToken);
const useStub = !hasTursoConfig || (isDev && process.env.TURSO_DEV_STUB !== "0");
let warned = false;
const sessionSecret =
  process.env.SESSION_SECRET ?? (useStub ? "dev-session-secret" : undefined);

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not set.");
}

if (useStub && isDev && !process.env.SESSION_SECRET && !warned) {
  warned = true;
  console.warn(
    "[iSquat] SESSION_SECRET is not set. Using a dev-only fallback secret."
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string) {
  return crypto.createHmac("sha256", sessionSecret).update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await db.execute({
    sql: `
      INSERT INTO sessions (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    args: [sessionId, userId, tokenHash, expiresAt.toISOString()],
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.execute({
      sql: "DELETE FROM sessions WHERE token_hash = ?",
      args: [hashToken(token)],
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const result = await db.execute({
    sql: `
      SELECT u.id, u.email, u.name, u.role, u.status
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
      LIMIT 1
    `,
    args: [hashToken(token), nowIso],
  });

  const row = result.rows[0] as User | undefined;

  if (!row || row.status !== "active") {
    return null;
  }

  return row;
}
