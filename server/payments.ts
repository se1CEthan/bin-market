import { cryptomusService } from './services/cryptomus';

// Example: Create a crypto payment invoice for a bot purchase
export async function createCryptoPayment(botId: string, buyerId: string, amount: number, currency: string = 'usd', returnUrl?: string) {
  return await cryptomusService.createInvoice(botId, buyerId, amount, currency, returnUrl);
}

// Example: Handle webhook callback from Cryptomus
export async function handleCryptoWebhook(webhookData: any) {
  return await cryptomusService.checkPaymentStatus(webhookData.uuid);
}