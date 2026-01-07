import { pool } from "../server/db";

async function addCryptoTransactionColumns() {
  console.log('🔄 Adding crypto transaction columns to transactions table...');
  
  try {
    // Check current transactions table structure
    const currentSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current transactions table schema:');
    currentSchema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      console.log(`  ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
    });
    
    // Check which crypto columns are missing
    const existingColumns = currentSchema.rows.map(row => row.column_name);
    const requiredCryptoColumns = ['crypto_invoice_id'];
    const missingColumns = requiredCryptoColumns.filter(col => !existingColumns.includes(col));
    
    console.log('\n🔍 Crypto columns status:');
    console.log('Required:', requiredCryptoColumns);
    console.log('Existing:', existingColumns.filter(col => requiredCryptoColumns.includes(col)));
    console.log('Missing:', missingColumns);
    
    // Add missing crypto columns
    for (const column of missingColumns) {
      switch (column) {
        case 'crypto_invoice_id':
          await pool.query(`
            ALTER TABLE transactions 
            ADD COLUMN crypto_invoice_id TEXT
          `);
          console.log('✅ Added crypto_invoice_id column');
          break;
      }
    }
    
    if (missingColumns.length === 0) {
      console.log('ℹ️ All crypto transaction columns already exist');
    }
    
    // Verify the columns were added
    const verifySchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name IN ('crypto_invoice_id', 'paypal_order_id', 'payment_method')
      ORDER BY column_name
    `);
    
    console.log('\n✅ Payment-related columns verification:');
    verifySchema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      console.log(`  - ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
    });
    
    // Test a simple query to make sure the columns work
    const testQuery = await pool.query(`
      SELECT id, payment_method, paypal_order_id, crypto_invoice_id 
      FROM transactions 
      LIMIT 1
    `);
    
    console.log('\n✅ Crypto transaction columns are working correctly!');
    if (testQuery.rows.length > 0) {
      console.log('Sample transaction data:', {
        id: testQuery.rows[0].id,
        payment_method: testQuery.rows[0].payment_method,
        paypal_order_id: testQuery.rows[0].paypal_order_id || 'null',
        crypto_invoice_id: testQuery.rows[0].crypto_invoice_id || 'null'
      });
    } else {
      console.log('No transactions in database yet - ready for first crypto purchase!');
    }
    
    console.log('\n🎉 Crypto transaction columns migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding crypto transaction columns:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addCryptoTransactionColumns().catch(console.error);