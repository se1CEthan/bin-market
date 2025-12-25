import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function migrateToProduction() {
  console.log('🚀 Starting production migration...');

  try {
    // Add new columns to users table
    console.log('Adding new columns to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `;

    // Update existing users to have email verified (for Google OAuth users)
    await sql`
      UPDATE users 
      SET is_email_verified = TRUE 
      WHERE google_id IS NOT NULL AND is_email_verified = FALSE;
    `;

    // Add new columns to transactions table
    console.log('Adding new columns to transactions table...');
    await sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paypal',
      ADD COLUMN IF NOT EXISTS refund_reason TEXT,
      ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
    `;

    // Update existing transactions
    await sql`
      UPDATE transactions 
      SET payment_method = 'paypal', completed_at = created_at 
      WHERE status = 'completed' AND payment_method IS NULL;
    `;

    // Create email verification tokens table
    console.log('Creating email_verification_tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create password reset tokens table
    console.log('Creating password_reset_tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create license keys table
    console.log('Creating license_keys table...');
    await sql`
      CREATE TABLE IF NOT EXISTS license_keys (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id VARCHAR NOT NULL REFERENCES transactions(id),
        bot_id VARCHAR NOT NULL REFERENCES bots(id),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        license_key TEXT NOT NULL UNIQUE,
        download_url TEXT,
        download_count INTEGER DEFAULT 0 NOT NULL,
        max_downloads INTEGER DEFAULT 5 NOT NULL,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create support tickets table
    console.log('Creating support_tickets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        bot_id VARCHAR REFERENCES bots(id),
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'open' NOT NULL,
        priority TEXT DEFAULT 'medium' NOT NULL,
        assigned_to VARCHAR REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create support ticket messages table
    console.log('Creating support_ticket_messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS support_ticket_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id VARCHAR NOT NULL REFERENCES support_tickets(id),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        is_staff BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create bot versions table
    console.log('Creating bot_versions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bot_versions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        bot_id VARCHAR NOT NULL REFERENCES bots(id),
        version TEXT NOT NULL,
        changelog TEXT,
        file_url TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create payment methods table
    console.log('Creating payment_methods table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        type TEXT NOT NULL DEFAULT 'paypal',
        paypal_email TEXT,
        is_default BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create audit logs table
    console.log('Creating audit_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id VARCHAR,
        details JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create indexes for performance
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)',
      'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_license_keys_transaction_id ON license_keys(transaction_id)',
      'CREATE INDEX IF NOT EXISTS idx_license_keys_user_id ON license_keys(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_license_keys_license_key ON license_keys(license_key)',
      'CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)',
      'CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id)',
      'CREATE INDEX IF NOT EXISTS idx_bot_versions_bot_id ON bot_versions(bot_id)',
      'CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type)'
    ];

    for (const indexQuery of indexes) {
      await sql.unsafe(indexQuery);
    }

    console.log('✅ Production migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrateToProduction().catch(console.error);