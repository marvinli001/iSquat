"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import type { Row } from "@libsql/core/api";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";

const allowedRedirects = new Set(["/dashboard/add"]);

const isAllowedRedirect = (path: string) => {
  if (allowedRedirects.has(path)) {
    return true;
  }
  return /^\/toilet\/[\w-]+\/review$/.test(path);
};

function getRedirectTarget(formData: FormData) {
  const redirectTo = formData.get("redirectTo")?.toString() ?? "";
  return isAllowedRedirect(redirectTo) ? redirectTo : null;
}

function buildAuthErrorUrl(code: string, redirectTarget: string | null) {
  const params = new URLSearchParams({ error: code });
  if (redirectTarget) {
    params.set("redirectTo", redirectTarget);
  }
  return `/auth?${params.toString()}`;
}

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

type UserRow = {
  id: string;
  password_hash: string;
  role: "user" | "admin";
  status: "active" | "disabled";
};

function parseUserRow(row: Row | undefined): UserRow | undefined {
  if (!row) {
    return undefined;
  }

  const id = row.id;
  const passwordHash = row.password_hash;
  const role = row.role;
  const status = row.status;

  if (typeof id !== "string" || typeof passwordHash !== "string") {
    return undefined;
  }

  if (role !== "user" && role !== "admin") {
    return undefined;
  }

  if (status !== "active" && status !== "disabled") {
    return undefined;
  }

  return { id, password_hash: passwordHash, role, status };
}

export async function signIn(formData: FormData) {
  const emailInput = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const email = normalizeEmail(emailInput);
  const redirectTarget = getRedirectTarget(formData);
  const errorUrl = (code: string) => buildAuthErrorUrl(code, redirectTarget);

  if (!email || !password) {
    redirect(errorUrl("missing"));
  }

  const result = await db.execute({
    sql: `
      SELECT id, password_hash, role, status
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    args: [email],
  });

  const row = parseUserRow(result.rows[0]);

  if (!row || row.status !== "active") {
    redirect(errorUrl("invalid"));
  }

  const isValid = await verifyPassword(password, row.password_hash);

  if (!isValid) {
    redirect(errorUrl("invalid"));
  }

  await createSession(row.id);
  if (row.role !== "admin" && redirectTarget) {
    redirect(redirectTarget);
  }
  redirect(row.role === "admin" ? "/admin" : "/dashboard");
}

export async function signUp(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const emailInput = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const email = normalizeEmail(emailInput);
  const redirectTarget = getRedirectTarget(formData);
  const errorUrl = (code: string) => buildAuthErrorUrl(code, redirectTarget);

  if (!email || !password) {
    redirect(errorUrl("missing"));
  }

  if (password.length < 8) {
    redirect(errorUrl("weak"));
  }

  const existing = await db.execute({
    sql: "SELECT 1 FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  if (existing.rows.length > 0) {
    redirect(errorUrl("exists"));
  }

  const adminEmails = getAdminEmails();
  const role = adminEmails.includes(email) ? "admin" : "user";
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.execute({
    sql: `
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [userId, email, passwordHash, name || null, role],
  });

  await createSession(userId);
  if (role !== "admin" && redirectTarget) {
    redirect(redirectTarget);
  }
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function signOut() {
  const { clearSession } = await import("@/lib/auth");
  await clearSession();
  redirect("/");
}
