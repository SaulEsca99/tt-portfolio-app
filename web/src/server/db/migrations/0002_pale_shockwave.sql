CREATE TABLE "medication" (
	"id" serial PRIMARY KEY NOT NULL,
	"donor_id" text NOT NULL,
	"active_substance" varchar(255) NOT NULL,
	"dosage" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"brand" varchar(255),
	"presentation" varchar(100),
	"expiry_date" timestamp NOT NULL,
	"lot_number" varchar(100),
	"laboratory" varchar(255),
	"photo_url" varchar(500),
	"location" varchar(255) NOT NULL,
	"postal_code" varchar(20),
	"preferred_schedule" text,
	"status" varchar(50) DEFAULT 'disponible' NOT NULL,
	"description" text,
	"notes" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"hidden_reason" varchar(255),
	"is_controlled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medication" ADD CONSTRAINT "medication_donor_id_user_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;