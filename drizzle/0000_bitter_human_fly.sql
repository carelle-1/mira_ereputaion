CREATE TABLE `ghostroar_resources` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` text NOT NULL,
	`data` json NOT NULL,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(6) NOT NULL DEFAULT (now()),
	CONSTRAINT `ghostroar_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ghostroar_sessions` (
	`token_hash` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` timestamp(6) NOT NULL,
	CONSTRAINT `ghostroar_sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `ghostroar_users` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_demo` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(6) NOT NULL DEFAULT (now()),
	CONSTRAINT `ghostroar_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `ghostroar_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `ghostroar_resources` ADD CONSTRAINT `ghostroar_resources_user_id_ghostroar_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `ghostroar_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ghostroar_sessions` ADD CONSTRAINT `ghostroar_sessions_user_id_ghostroar_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `ghostroar_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `resource_owner_type_idx` ON `ghostroar_resources` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `ghostroar_sessions` (`user_id`);