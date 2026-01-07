const PLATFORM_PAYPAL_EMAIL = process.env.PLATFORM_PAYPAL_EMAIL || "xselle34@gmail.com";

import { storage } from './storage';

/**
 * Send automatic payout to developer (90%) after a sale
 * Platform keeps 10% automatically
 */
export async function sendAutomaticPayout(
  developerId: string,
  developerPaypalEmail: string,
  amount: number,
  botTitle: string,
  transactionId: string
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    // Calculate split amounts (90% developer, 10% platform)
    const developerAmountFloat = parseFloat((amount * 0.9).toFixed(2));
    // Ensure platform receives the remainder to account for rounding
    const platformAmountFloat = parseFloat((amount - developerAmountFloat).toFixed(2));

    const developerAmount = developerAmountFloat.toFixed(2);
    const platformAmount = platformAmountFloat.toFixed(2);

    // Create payout batch with two items: developer (90%) and platform (10%)
    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `payout_${transactionId}_${Date.now()}`,
        email_subject: "You received a payment from BIN Marketplace",
        email_message: `Payment for bot sale: ${botTitle}`,
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: developerAmount,
            currency: "USD",
          },
          receiver: developerPaypalEmail,
          note: `Bot sale: ${botTitle} - Developer earnings (90%)`,
          sender_item_id: `${transactionId}_dev`,
        },
        {
          recipient_type: "EMAIL",
          amount: {
            value: platformAmount,
            currency: "USD",
          },
          receiver: PLATFORM_PAYPAL_EMAIL,
          note: `Bot sale: ${botTitle} - Platform commission (10%)`,
          sender_item_id: `${transactionId}_platform`,
        },
      ],
    };

    // Create a DB payout request record (pending)

    // All PayPal payout/payment logic removed. Use server/services/nowpayments.ts for crypto payments and developer payouts.
      amount: developerAmount,
