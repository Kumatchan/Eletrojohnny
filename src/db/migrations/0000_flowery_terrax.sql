CREATE TABLE `email_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`imap_host` text NOT NULL,
	`imap_port` integer NOT NULL,
	`imap_user` text NOT NULL,
	`imap_password` text NOT NULL,
	`energy_company_email` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_configs_user_id_unique` ON `email_configs` (`user_id`);--> statement-breakpoint
CREATE TABLE `energy_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`produced` real DEFAULT 0 NOT NULL,
	`consumed` real DEFAULT 0 NOT NULL,
	`exported` real DEFAULT 0 NOT NULL,
	`imported` real DEFAULT 0 NOT NULL,
	`savings` real DEFAULT 0 NOT NULL,
	`email_subject` text,
	`email_date` integer,
	`created_at` integer
);
