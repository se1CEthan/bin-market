import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function setupNeonDatabase() {
  console.log('🚀 Setting up Neon database for BIN Marketplace...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('');
    console.log('Please update your .env file with your Neon connection string:');
    console.log('DATABASE_URL=postgresql://username:password@ep-your-endpoint.region.aws.neon.tech/neondb?sslmode=require');
    process.exit(1);
  }

  try {
    // Test connection
    console.log('🔗 Testing Neon database connection...');
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Test query
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to Neon PostgreSQL:', result[0].version.split(' ')[0]);

    // Close connection
    await sql.end();

    console.log('');
    console.log('✅ Neon database connection successful!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npx drizzle-kit push');
    console.log('2. Run: npx tsx scripts/seed-production-only.ts');
    console.log('3. Run: npm run dev');
    console.log('');
    console.log('🎯 Your BIN marketplace will be ready for production!');

  } catch (error) {
    console.error('❌ Failed to connect to Neon database:', error);
    console.log('');
    console.log('Please check:');
    console.log('1. Your DATABASE_URL is correct');
    console.log('2. Your Neon database is running');
    console.log('3. Your network connection is stable');
  }
}

setupNeonDatabase();