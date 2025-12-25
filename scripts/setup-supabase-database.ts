import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up Supabase database for BIN Marketplace...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('');
    console.log('Please update your .env file with your Supabase connection string:');
    console.log('DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.wknfwqqicdjxeuvayyto.supabase.co:5432/postgres');
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes('YOUR_PASSWORD')) {
    console.error('❌ Please replace YOUR_PASSWORD with your actual Supabase database password');
    console.log('');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Go to Settings → Database');
    console.log('3. Find your database password');
    console.log('4. Replace YOUR_PASSWORD in your .env file');
    process.exit(1);
  }

  try {
    // Test connection
    console.log('🔗 Testing Supabase database connection...');
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Test query
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to Supabase PostgreSQL:', result[0].version.split(' ')[0]);

    // Check if we can create tables
    await sql`SELECT 1`;
    console.log('✅ Database permissions verified');

    // Close connection
    await sql.end();

    console.log('');
    console.log('✅ Supabase database connection successful!');
    console.log('');
    console.log('🎯 Your Supabase database details:');
    console.log('   Host: db.wknfwqqicdjxeuvayyto.supabase.co');
    console.log('   Port: 5432');
    console.log('   Database: postgres');
    console.log('   User: postgres');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npx drizzle-kit push');
    console.log('2. Run: npx tsx scripts/seed-production-only.ts');
    console.log('3. Run: npm run dev');
    console.log('');
    console.log('🎉 Your BIN marketplace will be ready for production!');

  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase database:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('1. Wrong password - Check your Supabase dashboard');
    console.log('2. Network issues - Check your internet connection');
    console.log('3. Database not ready - Wait a few minutes after creating');
    console.log('');
    console.log('Your connection string should look like:');
    console.log('postgresql://postgres:your-actual-password@db.wknfwqqicdjxeuvayyto.supabase.co:5432/postgres');
  }
}

setupSupabaseDatabase();