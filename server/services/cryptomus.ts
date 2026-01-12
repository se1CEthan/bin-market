import axios from 'axios';
import crypto from 'crypto';

interface CryptomusConfig {
  apiKey: string;
  merchantId: string;
  webhookSecret: string;
  sandboxMode: boolean;
}

interface CreatePaymentRequest {
  amount: string;
  currency: string;
  network?: string;
  order_id: string;
  url_return: string;
  url_callback: string;
  is_subtract: number;
  lifetime: number;
  to_currency?: string;
}

interface PaymentResponse {
  uuid: string;
  order_id: string;
  amount: string;
  currency: string;
  url: string;
  txid?: string;
  status: number;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentStatus {
  uuid: string;
  order_id: string;
  amount: string;
  currency: string;
  payer_amount: string;
  payer_currency: string;
  status: number;
  is_final: boolean;
  txid?: string;
  network: string;
  created_at: string;
  updated_at: string;
}

interface SplitPayment {
  address: string;
  amount: string;
  currency: string;
  network: string;
  description: string;
}

class CryptomusService {
  private config: CryptomusConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.CRYPTOMUS_API_KEY || '',
      merchantId: process.env.CRYPTOMUS_MERCHANT_ID || '',
      webhookSecret: process.env.CRYPTOMUS_WEBHOOK_SECRET || 'default-secret',
      sandboxMode: process.env.NODE_ENV !== 'production'
    };
    
    this.baseURL = 'https://api.cryptomus.com/v1';

    // Log configuration status (without exposing sensitive data)
    console.log('Cryptomus Service initialized:', {
      hasApiKey: !!this.config.apiKey,
      hasMerchantId: !!this.config.merchantId,
      apiKeyLength: this.config.apiKey.length,
      sandboxMode: this.config.sandboxMode,
      baseURL: this.baseURL
    });
  }

  private getHeaders(data?: any) {
    const sign = this.generateSignature(data);
    return {
      'merchant': this.config.merchantId,
      'sign': sign,
      'Content-Type': 'application/json'
    };
  }

  private generateSignature(data?: any): string {
    const dataString = data ? JSON.stringify(data) : '';
    const signString = Buffer.from(dataString).toString('base64') + this.config.apiKey;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * Get available currencies for payments
   */
  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/exchange-rate/list`, {
        headers: this.getHeaders()
      });
      return response.data.result || [];
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
      // Cryptomus doesn't have a specific min amount endpoint
      // Return standard minimums based on currency
      const minimums: { [key: string]: number } = {
        'BTC': 0.0001,
        'ETH': 0.001,
        'USDT': 1,
        'USDC': 1,
        'LTC': 0.01,
        'BCH': 0.001,
        'TRX': 10,
        'BNB': 0.001
      };
      return minimums[currency.toUpperCase()] || 1;
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
        amount: botPrice.toString(),
        currency: 'USD',
        order_id: orderId,
        url_return: `${process.env.FRONTEND_URL}/payment/success/${botId}`,
        url_callback: `${process.env.FRONTEND_URL}/api/payments/cryptomus/webhook`,
        is_subtract: 1, // Subtract fees from amount
        lifetime: 3600, // 1 hour lifetime
        to_currency: preferredCurrency || 'BTC'
      };

      const response = await axios.post(`${this.baseURL}/payment`, paymentData, {
        headers: this.getHeaders(paymentData)
      });

      // Store payment info for later processing
      await this.storePaymentInfo(response.data.result.uuid, {
        botId,
        botPrice,
        developerWallet,
        platformWallet,
        orderId,
        customerEmail
      });

      return response.data.result;
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
      const data = { uuid: paymentId };
      const response = await axios.post(`${this.baseURL}/payment/info`, data, {
        headers: this.getHeaders(data)
      });
      return response.data.result;
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
      const developerAmount = (totalAmount * 0.9).toFixed(8);
      const platformAmount = (totalAmount * 0.1).toFixed(8);

      const splits: SplitPayment[] = [
        {
          address: developerWallet,
          amount: developerAmount,
          currency: currency,
          network: this.getNetworkForCurrency(currency),
          description: `Developer payout for payment ${paymentId} (90%)`
        },
        {
          address: platformWallet,
          amount: platformAmount,
          currency: currency,
          network: this.getNetworkForCurrency(currency),
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
   * Get network for currency
   */
  private getNetworkForCurrency(currency: string): string {
    const networks: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tron', // Default to TRC20 for USDT
      'USDC': 'ethereum',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'TRX': 'tron',
      'BNB': 'bsc'
    };
    return networks[currency.toUpperCase()] || 'ethereum';
  }

  /**
   * Create a payout to a wallet address
   */
  private async createPayout(split: SplitPayment): Promise<void> {
    try {
      const payoutData = {
        amount: split.amount,
        currency: split.currency,
        network: split.network,
        address: split.address,
        is_subtract: 1,
        url_callback: `${process.env.FRONTEND_URL}/api/payments/payout-webhook`
      };

      await axios.post(`${this.baseURL}/payout`, payoutData, {
        headers: this.getHeaders(payoutData)
      });

      console.log(`Payout created: ${split.amount} ${split.currency} to ${split.address}`);
    } catch (error: any) {
      console.error('Error creating payout:', error.response?.data || error.message);
      // Don't throw here to avoid breaking the entire split process
    }
  }

  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHash('md5')
        .update(Buffer.from(payload).toString('base64') + this.config.webhookSecret)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
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
      { code: 'BTC', name: 'Bitcoin', network: 'bitcoin' },
      { code: 'ETH', name: 'Ethereum', network: 'ethereum' },
      { code: 'LTC', name: 'Litecoin', network: 'litecoin' },
      { code: 'BCH', name: 'Bitcoin Cash', network: 'bitcoin-cash' },
      { code: 'XRP', name: 'Ripple', network: 'ripple' },
      { code: 'ADA', name: 'Cardano', network: 'cardano' },
      { code: 'DOT', name: 'Polkadot', network: 'polkadot' },
      { code: 'MATIC', name: 'Polygon', network: 'polygon' },
      { code: 'SOL', name: 'Solana', network: 'solana' },
      { code: 'USDT', name: 'Tether USD', network: 'tron' },
      { code: 'USDC', name: 'USD Coin', network: 'ethereum' },
      { code: 'DAI', name: 'Dai Stablecoin', network: 'ethereum' },
      { code: 'BUSD', name: 'Binance USD', network: 'bsc' },
      { code: 'BNB', name: 'Binance Coin', network: 'bsc' },
      { code: 'TRX', name: 'TRON', network: 'tron' },
      { code: 'DOGE', name: 'Dogecoin', network: 'dogecoin' },
      { code: 'SHIB', name: 'Shiba Inu', network: 'ethereum' },
      { code: 'AVAX', name: 'Avalanche', network: 'avalanche' }
    ];
  }

  /**
   * Get estimated exchange rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string, amount: number): Promise<number> {
    try {
      const data = {
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        course_source: 'binance'
      };
      
      const response = await axios.post(`${this.baseURL}/exchange-rate/${fromCurrency.toLowerCase()}/${toCurrency.toLowerCase()}`, data, {
        headers: this.getHeaders(data)
      });
      
      return parseFloat(response.data.result.course) * amount;
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
      if (!this.config.apiKey || !this.config.merchantId) {
        throw new Error('Cryptomus API key or Merchant ID is not configured');
      }

      // Validate inputs
      if (!botId || !buyerId || !amount || amount <= 0) {
        throw new Error('Invalid parameters: botId, buyerId, and positive amount are required');
      }

      const orderId = `bot_${botId}_${Date.now()}_${buyerId}`;
      const baseUrl = returnUrl || process.env.FRONTEND_URL || 'http://localhost:5000';
      
      console.log('Creating Cryptomus invoice with params:', {
        botId,
        buyerId,
        amount,
        currency,
        orderId,
        baseUrl
      });

      const paymentData: CreatePaymentRequest = {
        amount: amount.toString(),
        currency: currency.toUpperCase(),
        order_id: orderId,
        url_return: `${baseUrl}/payment/success?botId=${botId}`,
        url_callback: `${baseUrl}/api/cryptomus/webhook`,
        is_subtract: 1,
        lifetime: 3600,
        to_currency: 'BTC' // Default to Bitcoin, can be changed by user
      };

      console.log('Sending request to Cryptomus:', {
        url: `${this.baseURL}/payment`,
        data: paymentData
      });

      const response = await axios.post(`${this.baseURL}/payment`, paymentData, {
        headers: this.getHeaders(paymentData),
        timeout: 30000 // 30 second timeout
      });

      console.log('Cryptomus response received:', {
        status: response.status,
        hasData: !!response.data,
        paymentId: response.data?.result?.uuid
      });

      // Transform response to match expected interface
      const paymentResponse = response.data.result;
      return {
        id: paymentResponse.uuid,
        invoice_url: paymentResponse.url,
        pay_address: paymentResponse.address || '',
        pay_amount: paymentResponse.payer_amount || paymentResponse.amount,
        payCurrency: paymentResponse.payer_currency || paymentResponse.currency,
        price_amount: paymentResponse.amount,
        price_currency: paymentResponse.currency,
        order_id: paymentResponse.order_id,
        payment_status: paymentResponse.status,
        created_at: paymentResponse.created_at,
        updated_at: paymentResponse.updated_at
      };
    } catch (error: any) {
      console.error('Cryptomus createInvoice error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          hasApiKey: !!this.config.apiKey,
          hasMerchantId: !!this.config.merchantId,
          baseURL: this.baseURL
        }
      });
      
      if (error.response?.data) {
        throw new Error(`Cryptomus API error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Failed to create payment invoice: ${error.message}`);
    }
  }

  /**
   * Check payment status by invoice/payment ID
   */
  async checkPaymentStatus(invoiceId: string): Promise<any> {
    try {
      const data = { uuid: invoiceId };
      const response = await axios.post(`${this.baseURL}/payment/info`, data, {
        headers: this.getHeaders(data)
      });

      const payment = response.data.result;
      return {
        id: payment.uuid,
        status: payment.status,
        pay_address: payment.address || '',
        pay_amount: payment.payer_amount || payment.amount,
        pay_currency: payment.payer_currency || payment.currency,
        price_amount: payment.amount,
        price_currency: payment.currency,
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

export const cryptomusService = new CryptomusService();
export default CryptomusService;