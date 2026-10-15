CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"google_subject" text NOT NULL,
	"email" text NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_google_subject_unique" UNIQUE("google_subject")
);
