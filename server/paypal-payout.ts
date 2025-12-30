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
    const pendingRecord = await storage.createPayoutRequest({
      developerId,
      amount: developerAmount,
      paypalEmail: developerPaypalEmail,
      notes: JSON.stringify({ botTitle, transactionId, type: 'automatic' }),
      status: 'pending',
    });

    // Send payout using PayPal Payouts API
    const response = await fetch(
      `https://api-m.${process.env.NODE_ENV === 'production' ? '' : 'sandbox.'}paypal.com/v1/payments/payouts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify(payoutBatch),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('PayPal payout error:', errorBody);
      // Update DB record to failed
      await storage.updatePayoutRequest(pendingRecord.id, {
        status: 'failed',
        notes: JSON.stringify({ ...JSON.parse(pendingRecord.notes || '{}'), error: errorBody }),
        processedAt: new Date(),
      });

      return {
        success: false,
        error: errorBody || 'Failed to send payout',
      };
    }

    const result = await response.json();
    console.log('Payout sent successfully:', result);

    // Mark DB record as paid and attach payout_batch_id
    await storage.updatePayoutRequest(pendingRecord.id, {
      status: 'paid',
      notes: JSON.stringify({ ...JSON.parse(pendingRecord.notes || '{}'), payoutBatch: result.batch_header }),
      processedAt: new Date(),
    });

    return {
      success: true,
      payoutId: result.batch_header?.payout_batch_id,
    };
  } catch (error) {
    console.error('Automatic payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get PayPal access token for API calls
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.NODE_ENV === 'production' ? '' : 'sandbox.';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(
    `https://api-m.${environment}paypal.com/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Verify developer's PayPal email is valid
 */
export async function verifyPayPalEmail(email: string): Promise<boolean> {
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    console.error('PayPal email verification error:', error);
    return false;
  }
}

/**
 * Process pending payout requests (simple retry worker).
 * Attempts to send payouts for any `pending` payoutRequests in DB.
 */
export async function processPendingPayouts(): Promise<{ processed: number; errors: number }> {
  const pending = await storage.getPendingPayouts();
  let processed = 0;
  let errors = 0;

  for (const p of pending) {
    try {
      const amount = parseFloat(p.amount as any);
      // p.developerId and p.paypalEmail exist
      const result = await sendAutomaticPayout(p.developerId, p.paypalEmail, amount, `Retry for payout ${p.id}`, p.id);
      if (result.success) processed++;
      else errors++;
    } catch (err) {
      console.error('Retry payout error for', p.id, err);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Process a single payout request by id (used for manual retry by developer)
 */
export async function processPayoutRequest(payoutId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pending = await storage.getPendingPayouts();
    const p = pending.find((r) => r.id === payoutId);
    if (!p) return { success: false, error: 'Payout request not found or not pending' };

    const developerAmount = parseFloat(p.amount as any).toFixed(2);
    const platformAmountFloat = parseFloat((parseFloat(developerAmount) / 0.9 * 0.1).toFixed(2));
    const platformAmount = platformAmountFloat.toFixed(2);

    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `payout_retry_${payoutId}_${Date.now()}`,
        email_subject: "You received a payment from BIN Marketplace",
        email_message: `Retry payout for request ${payoutId}`,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: developerAmount, currency: 'USD' },
          receiver: p.paypalEmail,
          note: `Retry payout for ${p.notes || ''}`,
          sender_item_id: `${payoutId}_dev`,
        },
        {
          recipient_type: 'EMAIL',
          amount: { value: platformAmount, currency: 'USD' },
          receiver: PLATFORM_PAYPAL_EMAIL,
          note: `Platform commission for payout ${payoutId}`,
          sender_item_id: `${payoutId}_platform`,
        },
      ],
    };

    const response = await fetch(
      `https://api-m.${process.env.NODE_ENV === 'production' ? '' : 'sandbox.'}paypal.com/v1/payments/payouts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify(payoutBatch),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      await storage.updatePayoutRequest(p.id, {
        status: 'failed',
        notes: JSON.stringify({ ...JSON.parse(p.notes || '{}'), error: errorBody }),
        processedAt: new Date(),
      });
      return { success: false, error: errorBody || 'Failed to send payout' };
    }

    const result = await response.json();
    await storage.updatePayoutRequest(p.id, {
      status: 'paid',
      notes: JSON.stringify({ ...JSON.parse(p.notes || '{}'), payoutBatch: result.batch_header }),
      processedAt: new Date(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('processPayoutRequest error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}
