type ExecuteArgs =
  | string
  | {
      sql: string;
      args?: unknown[] | Record<string, unknown>;
    };

type ResultSet = {
  rows: unknown[];
  columns: string[];
  rowsAffected: number;
  lastInsertRowid: number | string | null;
};

let warned = false;

const emptyResult: ResultSet = {
  rows: [],
  columns: [],
  rowsAffected: 0,
  lastInsertRowid: null,
};

export function createClient() {
  if (!warned && process.env.NODE_ENV !== "production") {
    warned = true;
    console.warn(
      "[iSquat] Using libsql stub. DB calls are no-ops in this environment."
    );
  }

  return {
    async execute(_input: ExecuteArgs) {
      return emptyResult;
    },
  };
}
