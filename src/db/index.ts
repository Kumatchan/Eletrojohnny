import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let db: any = null;
let dbError: string | null = null;

// Try to create SQLite database connection, but handle errors gracefully
try {
  const sqlite = new Database("energy_data.db");
  db = drizzle(sqlite, { schema });
} catch (error: any) {
  console.error("Erro ao conectar ao banco de dados SQLite:", error?.message || error);
  dbError = error?.message || "Banco de dados não disponível";
}

export { db, schema, dbError };
