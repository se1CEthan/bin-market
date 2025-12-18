import Stripe from 'stripe';
import { db } from '../db';
import { transactions, users, bots } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendPurchaseConfirmation } from './email';
import { LicenseService } from './license';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export class StripeService {
  // Create payment intent for bot purchase
  static async createPaymentIntent(
    botId: string,
    buyerId: string,
    amount: number,
    currency: string = 'usd'
  ) {
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

      // Create Stripe customer if not exists
      let customerId = buyer.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: buyer.email,
          name: buyer.name,
          metadata: {
            userId: buyer.id,
          },
        });
        customerId = customer.id;

        // Update user with Stripe customer ID
        await db.update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, buyerId));
      }

      // Calculate fees
      const platformFee = Math.round(amount * 0.10); // 10% platform fee
      const developerEarnings = amount - platformFee;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        metadata: {
          botId,
          buyerId,
          developerId: bot.developerId,
          platformFee: platformFee.toString(),
          developerEarnings: developerEarnings.toString(),
        },
        description: `Purchase of ${bot.title}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create transaction record
      const [transaction] = await db.insert(transactions).values({
        buyerId,
        botId,
        developerId: bot.developerId,
        amount: amount.toString(),
        platformFee: platformFee.toString(),
        developerEarnings: developerEarnings.toString(),
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      }).returning();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transaction,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw error;
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntentId: string) {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      // Find transaction
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.stripePaymentIntentId, paymentIntentId),
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
        return { success: true, message: 'Already processed' };
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
      };
    } catch (error) {
      console.error('Payment success handling error:', error);
      throw error;
    }
  }

  // Create webhook endpoint handler
  static async handleWebhook(body: Buffer, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentSuccess(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentFailure(failedPayment.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  // Handle payment failure
  static async handlePaymentFailure(paymentIntentId: string) {
    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.stripePaymentIntentId, paymentIntentId),
      });

      if (transaction) {
        await db.update(transactions)
          .set({ status: 'failed' })
          .where(eq(transactions.id, transaction.id));
      }
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
  }

  // Create refund
  static async createRefund(transactionId: string, reason?: string) {
    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
      });

      if (!transaction || !transaction.stripePaymentIntentId) {
        throw new Error('Transaction not found or not paid via Stripe');
      }

      if (transaction.status !== 'completed') {
        throw new Error('Cannot refund incomplete transaction');
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          transactionId,
          reason: reason || 'Customer request',
        },
      });

      // Update transaction
      await db.update(transactions)
        .set({
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      return { success: true, refund };
    } catch (error) {
      console.error('Refund creation error:', error);
      throw error;
    }
  }

  // Get payment methods for user
  static async getPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  // Detach payment method
  static async detachPaymentMethod(paymentMethodId: string) {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return { success: true };
    } catch (error) {
      console.error('Detach payment method error:', error);
      throw error;
    }
  }
}