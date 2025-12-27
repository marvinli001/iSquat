"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function signIn(formData: FormData) {
  const emailInput = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const email = normalizeEmail(emailInput);

  if (!email || !password) {
    redirect("/auth?error=missing");
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

  const row = result.rows[0] as
    | {
        id: string;
        password_hash: string;
        role: "user" | "admin";
        status: "active" | "disabled";
      }
    | undefined;

  if (!row || row.status !== "active") {
    redirect("/auth?error=invalid");
  }

  const isValid = await verifyPassword(password, row.password_hash);

  if (!isValid) {
    redirect("/auth?error=invalid");
  }

  await createSession(row.id);
  redirect(row.role === "admin" ? "/admin" : "/dashboard");
}

export async function signUp(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const emailInput = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const email = normalizeEmail(emailInput);

  if (!email || !password) {
    redirect("/auth?error=missing");
  }

  if (password.length < 8) {
    redirect("/auth?error=weak");
  }

  const existing = await db.execute({
    sql: "SELECT 1 FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  if (existing.rows.length > 0) {
    redirect("/auth?error=exists");
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
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function signOut() {
  const { clearSession } = await import("@/lib/auth");
  await clearSession();
  redirect("/");
}
