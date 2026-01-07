import { pool } from "../server/db";

async function verifyCryptoSchema() {
  console.log('🔍 Verifying crypto schema in production database...');
  
  try {
    // Check users table structure
    const usersSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table schema:');
    usersSchema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      console.log(`  ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
    });
    
    // Check if crypto columns exist
    const cryptoColumns = usersSchema.rows.filter(row => 
      row.column_name === 'crypto_wallet' || row.column_name === 'crypto_enabled'
    );
    
    console.log('\n🔐 Crypto columns status:');
    if (cryptoColumns.length === 2) {
      console.log('✅ Both crypto_wallet and crypto_enabled columns exist');
      cryptoColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Missing crypto columns:', cryptoColumns.map(c => c.column_name));
    }
    
    // Check if there are any users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users in database: ${userCount.rows[0].count}`);
    
    // Test a simple select to make sure the columns work
    const testQuery = await pool.query(`
      SELECT id, email, name, crypto_wallet, crypto_enabled 
      FROM users 
      LIMIT 1
    `);
    
    console.log('\n✅ Crypto columns are working correctly!');
    if (testQuery.rows.length > 0) {
      console.log('Sample user data:', {
        id: testQuery.rows[0].id,
        email: testQuery.rows[0].email,
        crypto_wallet: testQuery.rows[0].crypto_wallet || 'null',
        crypto_enabled: testQuery.rows[0].crypto_enabled
      });
    }
    
  } catch (error) {
    console.error('❌ Error verifying crypto schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the verification
verifyCryptoSchema().catch(console.error);