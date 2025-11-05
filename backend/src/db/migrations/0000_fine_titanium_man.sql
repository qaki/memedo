CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chain" varchar(20) NOT NULL,
	"contract_address" varchar(100) NOT NULL,
	"token_name" varchar(100),
	"token_symbol" varchar(20),
	"results" jsonb NOT NULL,
	"completeness_score" integer NOT NULL,
	"sources_used" jsonb NOT NULL,
	"sources_failed" jsonb,
	"analysis_duration_ms" integer NOT NULL,
	"cache_hit" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid,
	"chain" varchar(20) NOT NULL,
	"contract_address" varchar(100),
	"provider" varchar(50) NOT NULL,
	"endpoint" varchar(255),
	"success" boolean NOT NULL,
	"response_time_ms" integer NOT NULL,
	"http_status_code" integer,
	"error_message" text,
	"error_type" varchar(50),
	"was_fallback" boolean DEFAULT false NOT NULL,
	"fallback_level" integer DEFAULT 0,
	"request_metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(100),
	"role" varchar(20) DEFAULT 'free' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_expires" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp,
	"analyses_this_month" integer DEFAULT 0 NOT NULL,
	"analyses_reset_date" timestamp DEFAULT now() NOT NULL,
	"saved_alerts_config" jsonb DEFAULT '{}' NOT NULL,
	"totp_secret" text,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(20) NOT NULL,
	"provider_subscription_id" varchar(255) NOT NULL,
	"provider_customer_id" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"plan_name" varchar(50) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_provider_subscription_id_unique" UNIQUE("provider_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analyses_user_id_idx" ON "analyses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analyses_chain_address_idx" ON "analyses" USING btree ("chain","contract_address");--> statement-breakpoint
CREATE INDEX "analyses_created_at_idx" ON "analyses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analyses_expires_at_idx" ON "analyses" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "api_logs_provider_idx" ON "api_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "api_logs_success_idx" ON "api_logs" USING btree ("success");--> statement-breakpoint
CREATE INDEX "api_logs_created_at_idx" ON "api_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_logs_chain_idx" ON "api_logs" USING btree ("chain");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_provider_sub_id_idx" ON "subscriptions" USING btree ("provider_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");