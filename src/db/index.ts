import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Create SQLite database connection
const sqlite = new Database("energy_data.db");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export { schema };
