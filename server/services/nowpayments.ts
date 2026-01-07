import { db } from '../db';
import { transactions, users, bots } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendPurchaseConfirmation } from './email';
import { LicenseService } from './license';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_BASE_URL = 'https://api.nowpayments.io/v1';

interface NowPaymentsInvoice {
  id: string;
  status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  payment_url: string;
}

export class NowPaymentsService {
  // Create a new payment invoice
  static async createInvoice(
    botId: string,
    buyerId: string,
    amount: number,
    currency: string = 'usd',
    returnUrl?: string,
  ): Promise<NowPaymentsInvoice> {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error('Missing NOWPayments API key.');
    }
    const bot = await db.query.bots.findFirst({ where: eq(bots.id, botId) });
    if (!bot) throw new Error('Bot not found');
    const buyer = await db.query.users.findFirst({ where: eq(users.id, buyerId) });
    if (!buyer) throw new Error('User not found');
    const baseUrl = returnUrl || process.env.FRONTEND_URL;
    if (!baseUrl) throw new Error('Missing FRONTEND_URL for NOWPayments return URLs.');
    if (typeof amount !== 'number' || !isFinite(amount) || amount < 0) throw new Error('Invalid amount.');
    // Calculate fees
    const platformFee = Math.round(amount * 0.10 * 100) / 100;
    const developerEarnings = Math.round((amount - platformFee) * 100) / 100;
    const orderId = `${buyerId}:${botId}:${Date.now()}`;
    const invoiceData = {
      price_amount: amount,
      price_currency: currency,
      order_id: orderId,
      ipn_callback_url: `${baseUrl}/api/nowpayments/ipn`,
      success_url: `${baseUrl}/payment/success/${botId}`,
      cancel_url: `${baseUrl}/payment/cancel/${botId}`,
      description: `Purchase of ${bot.title}`,
    };
    const response = await fetch(`${NOWPAYMENTS_BASE_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NOWPayments invoice creation failed: ${errorText}`);
    }
    const invoice: NowPaymentsInvoice = await response.json();
    await db.insert(transactions).values({
      buyerId,
      botId,
      developerId: bot.developerId,
      amount: amount.toString(),
      platformFee: platformFee.toString(),
      developerEarnings: developerEarnings.toString(),
      paymentMethod: 'nowpayments',
      nowpaymentsInvoiceId: invoice.id,
      status: 'pending',
    });
    return invoice;
  }

  // Handle IPN callback (to be called from your route)
  static async handleIPN(ipnData: any) {
    const { order_id, payment_status } = ipnData;
    const [buyerId, botId] = order_id.split(':');
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.nowpaymentsInvoiceId, ipnData.invoice_id),
      with: { bot: true, buyer: true, developer: true },
    });
    if (!transaction) throw new Error('Transaction not found');
    if (payment_status === 'finished' && transaction.status !== 'completed') {
      await db.update(transactions)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(transactions.id, transaction.id));
      const licenseData = await LicenseService.generateLicense(
        transaction.id,
        transaction.botId,
        transaction.buyerId
      );
      await db.update(bots)
        .set({ downloadCount: transaction.bot.downloadCount + 1 })
        .where(eq(bots.id, transaction.botId));
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
    }
    return { success: true };
  }
}
