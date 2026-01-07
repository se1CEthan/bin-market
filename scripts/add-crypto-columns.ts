import { pool } from "../server/db";

async function addCryptoColumns() {
  console.log('🔄 Adding crypto wallet columns to users table...');
  
  try {
    // Check if columns already exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('crypto_wallet', 'crypto_enabled')
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing crypto columns:', existingColumns);
    
    // Add crypto_wallet column if it doesn't exist
    if (!existingColumns.includes('crypto_wallet')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN crypto_wallet TEXT
      `);
      console.log('✅ Added crypto_wallet column');
    } else {
      console.log('ℹ️ crypto_wallet column already exists');
    }
    
    // Add crypto_enabled column if it doesn't exist
    if (!existingColumns.includes('crypto_enabled')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN crypto_enabled BOOLEAN DEFAULT false NOT NULL
      `);
      console.log('✅ Added crypto_enabled column');
    } else {
      console.log('ℹ️ crypto_enabled column already exists');
    }
    
    // Verify the columns were added
    const verifyColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('crypto_wallet', 'crypto_enabled')
      ORDER BY column_name
    `);
    
    console.log('✅ Crypto columns verification:');
    verifyColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    console.log('🎉 Crypto columns migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding crypto columns:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addCryptoColumns().catch(console.error);