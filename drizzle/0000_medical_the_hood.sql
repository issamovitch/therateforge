CREATE TABLE `market_cache` (
	`cache_key` text PRIMARY KEY NOT NULL,
	`market_context` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`ip` text NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`inputs_json` text NOT NULL,
	`report_json` text NOT NULL,
	`refined` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
