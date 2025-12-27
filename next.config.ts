import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const authToken =
  process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_AUTH_TOKEN;
const hasTursoConfig = Boolean(process.env.TURSO_DATABASE_URL && authToken);
const useStub = !hasTursoConfig || (isDev && process.env.TURSO_DEV_STUB !== "0");

const nextConfig: NextConfig = useStub
  ? {
      turbopack: {
        resolveAlias: {
          "@libsql/client": "./src/lib/libsqlStub.ts",
          "@libsql/client/web": "./src/lib/libsqlStub.ts",
        },
      },
    }
  : {};

export default nextConfig;
