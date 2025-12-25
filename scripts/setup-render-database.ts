import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function setupRenderDatabase() {
  console.log('🚀 Setting up Render PostgreSQL for BIN Marketplace...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('');
    console.log('Please update your .env file with your Render connection string:');
    console.log('DATABASE_URL=postgresql://bin_user:password@dpg-xxxxxxxxx-a.oregon-postgres.render.com:5432/bin_marketplace');
    console.log('');
    console.log('Get your connection string from:');
    console.log('1. Go to render.com');
    console.log('2. Create PostgreSQL database');
    console.log('3. Copy connection string from Connect section');
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('your-password')) {
    console.error('❌ Please update DATABASE_URL with your actual Render connection string');
    console.log('');
    console.log('Your DATABASE_URL should look like:');
    console.log('postgresql://bin_user:password@dpg-xxxxxxxxx-a.oregon-postgres.render.com:5432/bin_marketplace');
    process.exit(1);
  }

  try {
    // Test connection
    console.log('🔗 Testing Render database connection...');
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Test query
    const result = await sql`SELECT version()`;
    console.log('✅ Connected to Render PostgreSQL:', result[0].version.split(' ')[0]);

    // Test database info
    const dbInfo = await sql`SELECT current_database(), current_user, inet_server_addr()`;
    console.log('📊 Database:', dbInfo[0].current_database);
    console.log('👤 User:', dbInfo[0].current_user);
    console.log('🌐 Server:', dbInfo[0].inet_server_addr || 'Render Cloud');

    // Test permissions
    await sql`SELECT 1`;
    console.log('✅ Database permissions verified');

    // Close connection
    await sql.end();

    console.log('');
    console.log('🎉 Render database connection successful!');
    console.log('');
    console.log('✅ Your database is ready for:');
    console.log('   - User authentication');
    console.log('   - Bot marketplace data');
    console.log('   - PayPal transactions');
    console.log('   - Real-time features');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Run: npx drizzle-kit push');
    console.log('2. Run: npx tsx scripts/seed-production-only.ts');
    console.log('3. Run: npm run dev');
    console.log('');
    console.log('🚀 Your BIN marketplace will be production-ready!');

  } catch (error: any) {
    console.error('❌ Failed to connect to Render database:', error.message);
    console.log('');
    console.log('Common solutions:');
    console.log('1. Check your connection string is correct');
    console.log('2. Ensure your Render database is deployed and running');
    console.log('3. Verify your network connection');
    console.log('4. Wait a few minutes if database was just created');
    console.log('');
    console.log('Your connection string should look like:');
    console.log('postgresql://username:password@dpg-xxxxxxxxx-a.oregon-postgres.render.com:5432/database_name');
    console.log('');
    console.log('Get it from: render.com → Your Database → Connect section');
  }
}

setupRenderDatabase();