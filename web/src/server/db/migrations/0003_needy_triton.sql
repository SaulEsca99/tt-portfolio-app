-- Crear tabla medication_request
CREATE TABLE IF NOT EXISTS "medication_request" (
	"id" text PRIMARY KEY NOT NULL,
	"medication_id" integer NOT NULL,
	"requester_id" text NOT NULL,
	"requester_name" text NOT NULL,
	"requester_phone" text NOT NULL,
	"medical_situation" text NOT NULL,
	"urgency_level" text DEFAULT 'medium' NOT NULL,
	"socioeconomic_score" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Agregar foreign keys
ALTER TABLE "medication_request" ADD CONSTRAINT "medication_request_medication_id_medication_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medication"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medication_request" ADD CONSTRAINT "medication_request_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

-- Crear índices
CREATE INDEX IF NOT EXISTS "medication_request_medication_id_idx" ON "medication_request" USING btree ("medication_id");
CREATE INDEX IF NOT EXISTS "medication_request_requester_id_idx" ON "medication_request" USING btree ("requester_id");
CREATE INDEX IF NOT EXISTS "medication_request_status_idx" ON "medication_request" USING btree ("status");