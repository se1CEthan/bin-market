import { NowPaymentsService } from './services/nowpayments';

// Example: Create a crypto payment invoice for a bot purchase
export async function createCryptoPayment(botId: string, buyerId: string, amount: number, currency: string = 'usd', returnUrl?: string) {
  return await NowPaymentsService.createInvoice(botId, buyerId, amount, currency, returnUrl);
}

// Example: Handle IPN callback from NOWPayments
export async function handleCryptoIPN(ipnData: any) {
  return await NowPaymentsService.handleIPN(ipnData);
}