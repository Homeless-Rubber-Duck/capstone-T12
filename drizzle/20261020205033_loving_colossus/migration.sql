CREATE TABLE `customer` (
	`customer_id` integer PRIMARY KEY AUTOINCREMENT,
	`full_name` text(120) NOT NULL,
	`email` text(255) NOT NULL UNIQUE,
	`phone` text(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_authentication` (
	`customer_auth_id` integer PRIMARY KEY AUTOINCREMENT,
	`customer_id` integer NOT NULL,
	`password_hash` text(255) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `fk_customer_authentication_customer_id_customer_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`)
);
--> statement-breakpoint
CREATE TABLE `customer_order` (
	`order_id` integer PRIMARY KEY AUTOINCREMENT,
	`customer_id` integer NOT NULL,
	`status_id` integer NOT NULL,
	`pickup_time` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `fk_customer_order_customer_id_customer_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`),
	CONSTRAINT `fk_customer_order_status_id_order_status_status_id_fk` FOREIGN KEY (`status_id`) REFERENCES `order_status`(`status_id`)
);
--> statement-breakpoint
CREATE TABLE `menu_category` (
	`category_id` integer PRIMARY KEY AUTOINCREMENT,
	`category_name` text(80) NOT NULL,
	`display_order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menu_item` (
	`menu_item_id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text(120) NOT NULL,
	`description` text(500),
	`price` real NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`image_url` text(500),
	`category_id` integer NOT NULL,
	CONSTRAINT `fk_menu_item_category_id_menu_category_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `menu_category`(`category_id`)
);
--> statement-breakpoint
CREATE TABLE `menu_item_modifier_group` (
	`menu_item_modifier_group_id` integer PRIMARY KEY AUTOINCREMENT,
	`menu_item_id` integer NOT NULL,
	`modifier_group_id` integer NOT NULL,
	CONSTRAINT `fk_menu_item_modifier_group_menu_item_id_menu_item_menu_item_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_item`(`menu_item_id`),
	CONSTRAINT `fk_menu_item_modifier_group_modifier_group_id_modifier_group_modifier_group_id_fk` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_group`(`modifier_group_id`)
);
--> statement-breakpoint
CREATE TABLE `modifier_group` (
	`modifier_group_id` integer PRIMARY KEY AUTOINCREMENT,
	`group_name` text(80) NOT NULL,
	`min_selection` integer NOT NULL,
	`max_selection` integer,
	`display_order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `modifier_option` (
	`modifier_option_id` integer PRIMARY KEY AUTOINCREMENT,
	`modifier_group_id` integer NOT NULL,
	`option_name` text(80) NOT NULL,
	`price_adjustment` real DEFAULT 0 NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`display_order` integer NOT NULL,
	CONSTRAINT `fk_modifier_option_modifier_group_id_modifier_group_modifier_group_id_fk` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_group`(`modifier_group_id`)
);
--> statement-breakpoint
CREATE TABLE `order_activity_report` (
	`report_id` integer PRIMARY KEY AUTOINCREMENT,
	`generated_by_staff_id` integer NOT NULL,
	`report_date` text NOT NULL,
	`order_count` integer NOT NULL,
	`status_summary` text(255),
	CONSTRAINT `fk_order_activity_report_generated_by_staff_id_staff_staff_id_fk` FOREIGN KEY (`generated_by_staff_id`) REFERENCES `staff`(`staff_id`)
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`order_item_id` integer PRIMARY KEY AUTOINCREMENT,
	`order_id` integer NOT NULL,
	`menu_item_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`item_notes` text(500),
	CONSTRAINT `fk_order_item_order_id_customer_order_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `customer_order`(`order_id`),
	CONSTRAINT `fk_order_item_menu_item_id_menu_item_menu_item_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_item`(`menu_item_id`)
);
--> statement-breakpoint
CREATE TABLE `order_item_modifier` (
	`order_item_modifier_id` integer PRIMARY KEY AUTOINCREMENT,
	`order_item_id` integer NOT NULL,
	`modifier_option_id` integer NOT NULL,
	`price_adjustment` real NOT NULL,
	CONSTRAINT `fk_order_item_modifier_order_item_id_order_item_order_item_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`order_item_id`),
	CONSTRAINT `fk_order_item_modifier_modifier_option_id_modifier_option_modifier_option_id_fk` FOREIGN KEY (`modifier_option_id`) REFERENCES `modifier_option`(`modifier_option_id`)
);
--> statement-breakpoint
CREATE TABLE `order_status` (
	`status_id` integer PRIMARY KEY AUTOINCREMENT,
	`status_name` text(40) NOT NULL UNIQUE,
	`description` text(255)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`status_history_id` integer PRIMARY KEY AUTOINCREMENT,
	`order_id` integer NOT NULL,
	`status_id` integer NOT NULL,
	`changed_by_staff_id` integer,
	`changed_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`note` text(255),
	CONSTRAINT `fk_order_status_history_order_id_customer_order_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `customer_order`(`order_id`),
	CONSTRAINT `fk_order_status_history_status_id_order_status_status_id_fk` FOREIGN KEY (`status_id`) REFERENCES `order_status`(`status_id`),
	CONSTRAINT `fk_order_status_history_changed_by_staff_id_staff_staff_id_fk` FOREIGN KEY (`changed_by_staff_id`) REFERENCES `staff`(`staff_id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`staff_id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text(255) NOT NULL UNIQUE,
	`full_name` text(120) NOT NULL,
	`role` text(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff_authentication` (
	`staff_auth_id` integer PRIMARY KEY AUTOINCREMENT,
	`staff_id` integer NOT NULL,
	`username` text(100) NOT NULL UNIQUE,
	`password_hash` text(255) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `fk_staff_authentication_staff_id_staff_staff_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`)
);
