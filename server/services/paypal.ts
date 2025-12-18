import { db } from '../db';
import { transactions, users, bots } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendPurchaseConfirmation } from './email';
import { LicenseService } from './license';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export class PayPalService {
  // Get PayPal access token
  static async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
      }

      const data: PayPalAccessToken = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw error;
    }
  }

  // Create PayPal order
  static async createOrder(
    botId: string,
    buyerId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<PayPalOrder> {
    try {
      const bot = await db.query.bots.findFirst({
        where: eq(bots.id, botId),
      });

      if (!bot) {
        throw new Error('Bot not found');
      }

      const buyer = await db.query.users.findFirst({
        where: eq(users.id, buyerId),
      });

      if (!buyer) {
        throw new Error('User not found');
      }

      const accessToken = await this.getAccessToken();

      // Calculate fees
      const platformFee = Math.round(amount * 0.10 * 100) / 100; // 10% platform fee
      const developerEarnings = Math.round((amount - platformFee) * 100) / 100;

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: botId,
          description: `Purchase of ${bot.title}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: `${buyerId}:${botId}`,
        }],
        application_context: {
          brand_name: 'BIN Marketplace',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        },
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal order creation failed: ${errorText}`);
      }

      const order: PayPalOrder = await response.json();

      // Create transaction record
      await db.insert(transactions).values({
        buyerId,
        botId,
        developerId: bot.developerId,
        amount: amount.toString(),
        platformFee: platformFee.toString(),
        developerEarnings: developerEarnings.toString(),
        paymentMethod: 'paypal',
        paypalOrderId: order.id,
        status: 'pending',
      });

      return order;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  }

  // Capture PayPal order
  static async captureOrder(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal capture failed: ${errorText}`);
      }

      const captureData = await response.json();

      // Find and update transaction
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.paypalOrderId, orderId),
        with: {
          bot: true,
          buyer: true,
          developer: true,
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status === 'completed') {
        return { success: true, message: 'Already processed', captureData };
      }

      // Update transaction status
      await db.update(transactions)
        .set({ 
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(transactions.id, transaction.id));

      // Generate license key and download URL
      const licenseData = await LicenseService.generateLicense(
        transaction.id,
        transaction.botId,
        transaction.buyerId
      );

      // Increment bot download count
      await db.update(bots)
        .set({ 
          downloadCount: transaction.bot.downloadCount + 1,
        })
        .where(eq(bots.id, transaction.botId));

      // Send purchase confirmation email
      if (transaction.buyer && transaction.bot) {
        await sendPurchaseConfirmation(
          transaction.buyer.email,
          transaction.buyer.name,
          transaction.bot.title,
          transaction.id,
          transaction.amount,
          licenseData.licenseKey,
          licenseData.downloadUrl,
          licenseData.maxDownloads
        );
      }

      // Update developer earnings
      if (transaction.developer) {
        const currentBalance = parseFloat(transaction.developer.availableBalance || '0');
        const earnings = parseFloat(transaction.developerEarnings);
        
        await db.update(users)
          .set({
            availableBalance: (currentBalance + earnings).toString(),
            totalEarnings: (parseFloat(transaction.developer.totalEarnings || '0') + earnings).toString(),
          })
          .where(eq(users.id, transaction.developerId));
      }

      return {
        success: true,
        transaction,
        licenseKey: licenseData.licenseKey,
        downloadUrl: licenseData.downloadUrl,
        captureData,
      };
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw error;
    }
  }

  // Get order details
  static async getOrderDetails(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`PayPal get order failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal get order error:', error);
      throw error;
    }
  }

  // Create refund
  static async createRefund(transactionId: string, reason?: string) {
    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
      });

      if (!transaction || !transaction.paypalOrderId) {
        throw new Error('Transaction not found or not paid via PayPal');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Cannot refund incomplete transaction');
      }

      // Get capture ID from order
      const orderDetails = await this.getOrderDetails(transaction.paypalOrderId);
      const captureId = orderDetails.purchase_units[0]?.payments?.captures?.[0]?.id;

      if (!captureId) {
        throw new Error('Capture ID not found');
      }

      const accessToken = await this.getAccessToken();

      // Create refund
      const refundData = {
        amount: {
          currency_code: 'USD',
          value: transaction.amount,
        },
        note_to_payer: reason || 'Refund processed',
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal refund failed: ${errorText}`);
      }

      const refund = await response.json();

      // Update transaction
      await db.update(transactions)
        .set({
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      // Deactivate license
      await LicenseService.deactivateLicense(transactionId);

      return { success: true, refund };
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }

  // Send payout to developer
  static async sendPayout(
    paypalEmail: string,
    amount: number,
    currency: string = 'USD',
    note?: string
  ) {
    try {
      const accessToken = await this.getAccessToken();

      const payoutData = {
        sender_batch_header: {
          sender_batch_id: `payout_${Date.now()}`,
          email_subject: 'You have a payout from BIN Marketplace',
          email_message: note || 'You have received a payout from BIN Marketplace',
        },
        items: [{
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency,
          },
          receiver: paypalEmail,
          note: note || 'Payout from BIN Marketplace',
          sender_item_id: `item_${Date.now()}`,
        }],
      };

      const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payoutData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal payout failed: ${errorText}`);
      }

      const payout = await response.json();
      return { success: true, payout };
    } catch (error) {
      console.error('PayPal payout error:', error);
      throw error;
    }
  }
}