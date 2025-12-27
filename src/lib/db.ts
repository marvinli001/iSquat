import { createClient } from "@libsql/client/web";

const url = process.env.TURSO_DATABASE_URL;
const authToken =
  process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN;
const hasTursoConfig = Boolean(url && authToken);
const isDev = process.env.NODE_ENV !== "production";
const useStub = !hasTursoConfig || (isDev && process.env.TURSO_DEV_STUB !== "0");

export const db = createClient({
  url: useStub ? "stub" : url!,
  authToken: useStub ? undefined : authToken,
});
