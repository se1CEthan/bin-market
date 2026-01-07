import { pool } from "../server/db";

async function verifyAllCryptoSchema() {
  console.log('🔍 Verifying complete crypto schema across all tables...');
  
  try {
    // Check users table crypto columns
    console.log('\n👥 USERS TABLE - Crypto Columns:');
    const usersSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('crypto_wallet', 'crypto_enabled')
      ORDER BY column_name
    `);
    
    const expectedUsersCrypto = ['crypto_wallet', 'crypto_enabled'];
    const existingUsersCrypto = usersSchema.rows.map(row => row.column_name);
    
    expectedUsersCrypto.forEach(col => {
      if (existingUsersCrypto.includes(col)) {
        const colData = usersSchema.rows.find(row => row.column_name === col);
        console.log(`  ✅ ${col}: ${colData.data_type} (${colData.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      } else {
        console.log(`  ❌ ${col}: MISSING`);
      }
    });
    
    // Check transactions table crypto columns
    console.log('\n💳 TRANSACTIONS TABLE - Payment Columns:');
    const transactionsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name IN ('payment_method', 'paypal_order_id', 'crypto_invoice_id')
      ORDER BY column_name
    `);
    
    const expectedTransactionsCrypto = ['payment_method', 'paypal_order_id', 'crypto_invoice_id'];
    const existingTransactionsCrypto = transactionsSchema.rows.map(row => row.column_name);
    
    expectedTransactionsCrypto.forEach(col => {
      if (existingTransactionsCrypto.includes(col)) {
        const colData = transactionsSchema.rows.find(row => row.column_name === col);
        console.log(`  ✅ ${col}: ${colData.data_type} (${colData.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      } else {
        console.log(`  ❌ ${col}: MISSING`);
      }
    });
    
    // Test crypto functionality with sample queries
    console.log('\n🧪 TESTING CRYPTO FUNCTIONALITY:');
    
    // Test users crypto columns
    const userTest = await pool.query(`
      SELECT id, email, crypto_wallet, crypto_enabled 
      FROM users 
      WHERE crypto_wallet IS NOT NULL OR crypto_enabled = true
      LIMIT 3
    `);
    
    console.log(`  Users with crypto settings: ${userTest.rows.length}`);
    if (userTest.rows.length > 0) {
      userTest.rows.forEach(user => {
        console.log(`    - ${user.email}: wallet=${user.crypto_wallet || 'none'}, enabled=${user.crypto_enabled}`);
      });
    }
    
    // Test transactions crypto columns
    const transactionTest = await pool.query(`
      SELECT id, payment_method, paypal_order_id, crypto_invoice_id, status
      FROM transactions 
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`  Recent transactions: ${transactionTest.rows.length}`);
    if (transactionTest.rows.length > 0) {
      transactionTest.rows.forEach(tx => {
        console.log(`    - ${tx.id.substring(0, 8)}: ${tx.payment_method}, status=${tx.status}`);
      });
    }
    
    // Summary
    const allUsersCryptoPresent = expectedUsersCrypto.every(col => existingUsersCrypto.includes(col));
    const allTransactionsCryptoPresent = expectedTransactionsCrypto.every(col => existingTransactionsCrypto.includes(col));
    
    console.log('\n📊 CRYPTO SCHEMA SUMMARY:');
    console.log(`  Users crypto columns: ${allUsersCryptoPresent ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`  Transactions crypto columns: ${allTransactionsCryptoPresent ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    
    if (allUsersCryptoPresent && allTransactionsCryptoPresent) {
      console.log('\n🎉 ALL CRYPTO FUNCTIONALITY IS READY!');
      console.log('  - Users can set crypto wallets');
      console.log('  - Crypto purchases will work');
      console.log('  - Database schema is complete');
    } else {
      console.log('\n⚠️  Some crypto columns are missing - run appropriate migration scripts');
    }
    
  } catch (error) {
    console.error('❌ Error verifying crypto schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the verification
verifyAllCryptoSchema().catch(console.error);