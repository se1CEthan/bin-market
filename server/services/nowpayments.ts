import axios from 'axios';
import crypto from 'crypto';

interface NOWPaymentsConfig {
  apiKey: string;
  ipnSecret: string;
  sandboxMode: boolean;
}

interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  payment_url: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
}

interface PaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
  created_at: string;
  updated_at: string;
}

interface SplitPayment {
  address: string;
  amount: number;
  currency: string;
  description: string;
}

class NOWPaymentsService {
  private config: NOWPaymentsConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.NOWPAYMENTS_API_KEY || '',
      ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || 'default-secret',
      sandboxMode: process.env.NODE_ENV !== 'production'
    };
    
    this.baseURL = this.config.sandboxMode 
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1';

    // Log configuration status (without exposing sensitive data)
    console.log('NOWPayments Service initialized:', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey.length,
      sandboxMode: this.config.sandboxMode,
      baseURL: this.baseURL
    });
  }

  private getHeaders() {
    return {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get available currencies for payments
   */
  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/currencies`, {
        headers: this.getHeaders()
      });
      return response.data.currencies;
    } catch (error) {
      console.error('Error fetching available currencies:', error);
      throw new Error('Failed to fetch available currencies');
    }
  }

  /**
   * Get minimum payment amount for a currency
   */
  async getMinimumAmount(currency: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/min-amount`, {
        headers: this.getHeaders(),
        params: { currency_from: currency, currency_to: 'usd' }
      });
      return response.data.min_amount;
    } catch (error) {
      console.error('Error fetching minimum amount:', error);
      throw new Error('Failed to fetch minimum amount');
    }
  }

  /**
   * Create a new payment with automatic revenue splitting
   */
  async createPayment(
    botId: string,
    botPrice: number,
    developerWallet: string,
    platformWallet: string,
    customerEmail?: string,
    preferredCurrency?: string
  ): Promise<PaymentResponse> {
    try {
      const orderId = `bot_${botId}_${Date.now()}`;
      
      const paymentData: CreatePaymentRequest = {
        price_amount: botPrice,
        price_currency: 'USD',
        pay_currency: preferredCurrency || 'btc',
        order_id: orderId,
        order_description: `Purchase Bot #${botId} - BIN Marketplace`,
        ipn_callback_url: `${process.env.FRONTEND_URL}/api/payments/nowpayments/webhook`,
        success_url: `${process.env.FRONTEND_URL}/payment/success/${botId}`,
        cancel_url: `${process.env.FRONTEND_URL}/bot/${botId}`,
        customer_email: customerEmail
      };

      const response = await axios.post(`${this.baseURL}/payment`, paymentData, {
        headers: this.getHeaders()
      });

      // Store payment info for later processing
      await this.storePaymentInfo(response.data.payment_id, {
        botId,
        botPrice,
        developerWallet,
        platformWallet,
        orderId,
        customerEmail
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', error.response?.data || error.message);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(`${this.baseURL}/payment/${paymentId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw new Error('Failed to fetch payment status');
    }
  }

  /**
   * Process revenue splitting after successful payment
   */
  async processSplitPayment(
    paymentId: string,
    totalAmount: number,
    currency: string,
    developerWallet: string,
    platformWallet: string
  ): Promise<void> {
    try {
      // Calculate splits: 90% to developer, 10% to platform
      const developerAmount = Math.floor(totalAmount * 0.9 * 100000000) / 100000000; // 8 decimal precision
      const platformAmount = Math.floor(totalAmount * 0.1 * 100000000) / 100000000;

      const splits: SplitPayment[] = [
        {
          address: developerWallet,
          amount: developerAmount,
          currency: currency,
          description: `Developer payout for payment ${paymentId} (90%)`
        },
        {
          address: platformWallet,
          amount: platformAmount,
          currency: currency,
          description: `Platform commission for payment ${paymentId} (10%)`
        }
      ];

      // Process each split payment
      for (const split of splits) {
        await this.createPayout(split);
      }

      console.log(`Split payment processed for ${paymentId}:`, {
        developer: `${developerAmount} ${currency}`,
        platform: `${platformAmount} ${currency}`
      });

    } catch (error) {
      console.error('Error processing split payment:', error);
      throw new Error('Failed to process split payment');
    }
  }

  /**
   * Create a payout to a wallet address
   */
  private async createPayout(split: SplitPayment): Promise<void> {
    try {
      const payoutData = {
        withdrawals: [
          {
            address: split.address,
            amount: split.amount,
            currency: split.currency.toLowerCase(),
            ipn_callback_url: `${process.env.FRONTEND_URL}/api/payments/payout-webhook`
          }
        ]
      };

      await axios.post(`${this.baseURL}/payout`, payoutData, {
        headers: this.getHeaders()
      });

      console.log(`Payout created: ${split.amount} ${split.currency} to ${split.address}`);
    } catch (error: any) {
      console.error('Error creating payout:', error.response?.data || error.message);
      // Don't throw here to avoid breaking the entire split process
    }
  }

  /**
   * Verify IPN signature for webhook security
   */
  verifyIPNSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha512', this.config.ipnSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying IPN signature:', error);
      return false;
    }
  }

  /**
   * Store payment information for processing
   */
  private async storePaymentInfo(paymentId: string, info: any): Promise<void> {
    // This would typically store in your database
    // For now, we'll use a simple in-memory store or file system
    console.log(`Storing payment info for ${paymentId}:`, info);
  }

  /**
   * Get supported cryptocurrencies with their details
   */
  async getSupportedCurrencies(): Promise<Array<{code: string, name: string, network?: string}>> {
    return [
      { code: 'btc', name: 'Bitcoin' },
      { code: 'eth', name: 'Ethereum' },
      { code: 'ltc', name: 'Litecoin' },
      { code: 'bch', name: 'Bitcoin Cash' },
      { code: 'xrp', name: 'Ripple' },
      { code: 'xlm', name: 'Stellar' },
      { code: 'ada', name: 'Cardano' },
      { code: 'dot', name: 'Polkadot' },
      { code: 'matic', name: 'Polygon' },
      { code: 'sol', name: 'Solana' },
      { code: 'usdt', name: 'Tether USD', network: 'ERC20' },
      { code: 'usdc', name: 'USD Coin', network: 'ERC20' },
      { code: 'dai', name: 'Dai Stablecoin', network: 'ERC20' },
      { code: 'busd', name: 'Binance USD', network: 'BEP20' },
      { code: 'bnb', name: 'Binance Coin' },
      { code: 'trx', name: 'TRON' },
      { code: 'doge', name: 'Dogecoin' },
      { code: 'shib', name: 'Shiba Inu', network: 'ERC20' }
    ];
  }

  /**
   * Get estimated exchange rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string, amount: number): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/estimate`, {
        headers: this.getHeaders(),
        params: {
          amount,
          currency_from: fromCurrency,
          currency_to: toCurrency
        }
      });
      return response.data.estimated_amount;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw new Error('Failed to fetch exchange rate');
    }
  }

  /**
   * Create invoice for bot purchase (wrapper around createPayment for compatibility)
   */
  async createInvoice(
    botId: string,
    buyerId: string,
    amount: number,
    currency: string = 'usd',
    returnUrl?: string
  ): Promise<any> {
    try {
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('NOWPayments API key is not configured');
      }

      // Validate inputs
      if (!botId || !buyerId || !amount || amount <= 0) {
        throw new Error('Invalid parameters: botId, buyerId, and positive amount are required');
      }

      const orderId = `bot_${botId}_${Date.now()}_${buyerId}`;
      const baseUrl = returnUrl || process.env.FRONTEND_URL || 'http://localhost:5000';
      
      console.log('Creating NOWPayments invoice with params:', {
        botId,
        buyerId,
        amount,
        currency,
        orderId,
        baseUrl
      });

      const paymentData: CreatePaymentRequest = {
        price_amount: amount,
        price_currency: currency.toUpperCase(),
        pay_currency: 'btc', // Default to Bitcoin, can be changed by user
        order_id: orderId,
        order_description: `Bot Purchase - ${botId}`,
        ipn_callback_url: `${baseUrl}/api/nowpayments/webhook`,
        success_url: `${baseUrl}/payment/success?botId=${botId}`,
        cancel_url: `${baseUrl}/bot/${botId}`,
      };

      console.log('Sending request to NOWPayments:', {
        url: `${this.baseURL}/payment`,
        data: paymentData
      });

      const response = await axios.post(`${this.baseURL}/payment`, paymentData, {
        headers: this.getHeaders(),
        timeout: 30000 // 30 second timeout
      });

      console.log('NOWPayments response received:', {
        status: response.status,
        hasData: !!response.data,
        paymentId: response.data?.payment_id
      });

      // Transform response to match expected interface
      const paymentResponse = response.data;
      return {
        id: paymentResponse.payment_id,
        invoice_url: paymentResponse.payment_url,
        pay_address: paymentResponse.pay_address,
        pay_amount: paymentResponse.pay_amount,
        payCurrency: paymentResponse.pay_currency,
        price_amount: paymentResponse.price_amount,
        price_currency: paymentResponse.price_currency,
        order_id: paymentResponse.order_id,
        payment_status: paymentResponse.payment_status,
        created_at: paymentResponse.created_at,
        updated_at: paymentResponse.updated_at
      };
    } catch (error: any) {
      console.error('NOWPayments createInvoice error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          hasApiKey: !!this.config.apiKey,
          baseURL: this.baseURL
        }
      });
      
      if (error.response?.data) {
        throw new Error(`NOWPayments API error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Failed to create payment invoice: ${error.message}`);
    }
  }

  /**
   * Check payment status by invoice/payment ID
   */
  async checkPaymentStatus(invoiceId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/payment/${invoiceId}`, {
        headers: this.getHeaders()
      });

      const payment = response.data;
      return {
        id: payment.payment_id,
        status: payment.payment_status,
        pay_address: payment.pay_address,
        pay_amount: payment.pay_amount,
        pay_currency: payment.pay_currency,
        price_amount: payment.price_amount,
        price_currency: payment.price_currency,
        order_id: payment.order_id,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      };
    } catch (error: any) {
      console.error('Error checking payment status:', error.response?.data || error.message);
      throw new Error(`Failed to check payment status: ${error.response?.data?.message || error.message}`);
    }
  }
}

export const nowPaymentsService = new NOWPaymentsService();
export default NOWPaymentsService;