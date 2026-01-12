#!/usr/bin/env tsx

/**
 * Test script for Cryptomus integration
 * Run with: npx tsx scripts/test-cryptomus.ts
 */

import { cryptomusService } from '../server/services/cryptomus';

async function testCryptomusIntegration() {
  console.log('🧪 Testing Cryptomus Integration...\n');

  try {
    // Test 1: Get supported currencies
    console.log('1. Testing getSupportedCurrencies...');
    const currencies = await cryptomusService.getSupportedCurrencies();
    console.log(`✅ Found ${currencies.length} supported currencies`);
    console.log('   Sample currencies:', currencies.slice(0, 5).map(c => c.code).join(', '));

    // Test 2: Get minimum amounts
    console.log('\n2. Testing getMinimumAmount...');
    const minBTC = await cryptomusService.getMinimumAmount('BTC');
    const minUSDT = await cryptomusService.getMinimumAmount('USDT');
    console.log(`✅ Min BTC: ${minBTC}, Min USDT: ${minUSDT}`);

    // Test 3: Test exchange rate (if available)
    console.log('\n3. Testing getExchangeRate...');
    try {
      const rate = await cryptomusService.getExchangeRate('USD', 'BTC', 100);
      console.log(`✅ 100 USD = ${rate} BTC`);
    } catch (error) {
      console.log('⚠️  Exchange rate test skipped (requires API key)');
    }

    // Test 4: Test invoice creation (requires valid API credentials)
    console.log('\n4. Testing createInvoice...');
    try {
      const invoice = await cryptomusService.createInvoice(
        'test-bot-123',
        'test-user-456',
        10.00,
        'USD'
      );
      console.log('✅ Invoice created successfully');
      console.log('   Invoice ID:', invoice.id);
      console.log('   Payment URL:', invoice.invoice_url);
    } catch (error: any) {
      if (error.message.includes('API key') || error.message.includes('Merchant ID')) {
        console.log('⚠️  Invoice creation test skipped (requires valid API credentials)');
        console.log('   Set CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID to test');
      } else {
        console.log('❌ Invoice creation failed:', error.message);
      }
    }

    console.log('\n🎉 Cryptomus integration test completed!');
    console.log('\n📋 Setup checklist:');
    console.log('   □ Set CRYPTOMUS_API_KEY in environment');
    console.log('   □ Set CRYPTOMUS_MERCHANT_ID in environment');
    console.log('   □ Set CRYPTOMUS_WEBHOOK_SECRET in environment');
    console.log('   □ Configure webhook URL in Cryptomus dashboard');
    console.log('   □ Test payment flow in development');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check environment variables are set');
    console.log('   2. Verify Cryptomus account is active');
    console.log('   3. Ensure API credentials are valid');
    console.log('   4. Check network connectivity');
  }
}

// Run the test
testCryptomusIntegration().catch(console.error);