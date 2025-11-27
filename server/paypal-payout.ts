const PLATFORM_PAYPAL_EMAIL = process.env.PLATFORM_PAYPAL_EMAIL || "platform@braininspirednetwork.cloud";

/**
 * Send automatic payout to developer (90%) after a sale
 * Platform keeps 10% automatically
 */
export async function sendAutomaticPayout(
  developerPaypalEmail: string,
  amount: number,
  botTitle: string,
  transactionId: string
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  try {
    
    // Calculate 90% for developer
    const developerAmount = (amount * 0.90).toFixed(2);
    
    // Create payout batch
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
          sender_item_id: transactionId,
        },
      ],
    };

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
      const error = await response.json();
      console.error('PayPal payout error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send payout',
      };
    }

    const result = await response.json();
    console.log('Payout sent successfully:', result);

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
