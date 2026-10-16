import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL || "postgresql://firozmohammad@localhost:5432/callagent";

const sql = postgres(connectionString);

async function run() {
  console.log("🚀 Creating payment_gateways table in PostgreSQL if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS "payment_gateways" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "provider" varchar(50) NOT NULL UNIQUE,
      "name" varchar(100) NOT NULL,
      "is_enabled" boolean DEFAULT true NOT NULL,
      "mode" varchar(20) DEFAULT 'live' NOT NULL,
      "live_key_id" text,
      "live_secret" text,
      "live_webhook_secret" text,
      "test_key_id" text,
      "test_secret" text,
      "test_webhook_secret" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  console.log("✅ payment_gateways table created successfully!");

  // Seed default Razorpay and Stripe records if they don't exist
  await sql`
    INSERT INTO "payment_gateways" (
      "provider", "name", "is_enabled", "mode",
      "live_key_id", "live_secret", "live_webhook_secret",
      "test_key_id", "test_secret", "test_webhook_secret"
    )
    VALUES (
      'razorpay', 'Razorpay', true, 'live',
      'rzp_live_89kjasd8213jks', '••••••••••••••••••••', 'whsec_90812398129038102938',
      'rzp_test_12abcd890123', '••••••••••••••••••••', 'whsec_test_90812398129038'
    )
    ON CONFLICT ("provider") DO NOTHING;
  `;

  await sql`
    INSERT INTO "payment_gateways" (
      "provider", "name", "is_enabled", "mode",
      "live_key_id", "live_secret", "live_webhook_secret",
      "test_key_id", "test_secret", "test_webhook_secret"
    )
    VALUES (
      'stripe', 'Stripe', true, 'live',
      'pk_live_51Ozx928123891023812', '••••••••••••••••••••', 'whsec_stripe_89123890123',
      'pk_test_51Ozx928TEST991203812', '••••••••••••••••••••', 'whsec_test_stripe_89123890123'
    )
    ON CONFLICT ("provider") DO NOTHING;
  `;

  console.log("✅ Razorpay and Stripe default rows ensured in database!");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
