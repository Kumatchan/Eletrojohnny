import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Tabela de configurações de e-mail IMAP
export const emailConfigs = sqliteTable("email_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(), // Identificador único do usuário
  email: text("email").notNull(),
  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull(),
  imapUser: text("imap_user").notNull(),
  imapPassword: text("imap_password").notNull(), // Criptografar em produção!
  energyCompanyEmail: text("energy_company_email"), // E-mail da compania de energia para filtrar
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Tabela de dados de energia extraídos dos e-mails
export const energyRecords = sqliteTable("energy_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  produced: real("produced").notNull().default(0),
  consumed: real("consumed").notNull().default(0),
  exported: real("exported").notNull().default(0),
  imported: real("imported").notNull().default(0),
  savings: real("savings").notNull().default(0),
  emailSubject: text("email_subject"),
  emailDate: integer("email_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
