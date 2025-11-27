# Automatic PayPal Payouts Guide

## Overview

The BIN Marketplace now supports **automatic PayPal payouts** for developers. When a buyer purchases a bot, the payment is automatically split:
- **90%** goes directly to the developer's PayPal account
- **10%** stays with the platform

## How It Works

### For Developers

1. **Set Up PayPal Account**
   - Go to Developer Dashboard → PayPal Settings tab
   - Enter your PayPal email address
   - Enable "Automatic Payouts"
   - Save settings

2. **Receive Automatic Payments**
   - When someone buys your bot, payment is captured by the platform
   - Within minutes, 90% is automatically sent to your PayPal account
   - You'll receive a PayPal notification
   - Track all payouts in your dashboard

3. **Benefits**
   - Instant payments (no waiting for manual processing)
   - No payout requests needed
   - Automatic 90/10 split
   - Full transparency

### For Platform Owner

1. **Configure Platform PayPal**
   - Add `PLATFORM_PAYPAL_EMAIL` to your `.env` file
   - This is where the 5% platform fee accumulates
   - Use your PayPal Business account email

2. **PayPal API Setup**
   - You need PayPal Payouts API access
   - Available with PayPal Business accounts
   - Configure in PayPal Developer Dashboard

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```env
# Your platform PayPal email (receives 5% commission)
PLATFORM_PAYPAL_EMAIL=platform@braininspirednetwork.cloud

# PayPal API credentials (must have Payouts API access)
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
NODE_ENV=production
```

### 2. PayPal Business Account Requirements

To use automatic payouts, you need:

1. **PayPal Business Account**
   - Sign up at https://www.paypal.com/business
   - Complete business verification

2. **Enable Payouts API**
   - Go to https://developer.paypal.com/
   - Create an app or use existing
   - Enable "Payouts" feature
   - Get Live credentials (not Sandbox)

3. **API Permissions**
   - Your app needs these permissions:
     - `https://uri.paypal.com/services/payments/payouts`
     - `https://uri.paypal.com/services/payments/payment`

### 3. Database Migration

The database schema has been updated with new fields:
- `users.paypalEmail` - Developer's PayPal email
- `users.paypalEnabled` - Whether automatic payouts are enabled

Run the migration:
```bash
npm run db:push
```

## Payment Flow

### Step-by-Step Process

1. **Buyer Purchases Bot**
   ```
   Buyer clicks "Buy Now" → PayPal checkout
   ```

2. **Payment Captured**
   ```
   Full amount captured to platform PayPal account
   Transaction recorded in database
   ```

3. **Automatic Split**
   ```
   If developer has PayPal enabled:
     - Calculate 90% for developer
     - Send payout via PayPal Payouts API
     - Developer receives payment instantly
     - Platform keeps 5% automatically
   
   If developer doesn't have PayPal enabled:
     - Full amount stays with platform
     - Developer must request manual payout
   ```

4. **Confirmation**
   ```
   Developer receives:
     - PayPal email notification
     - Dashboard notification
     - Transaction record
   ```

## Developer Experience

### Setting Up PayPal

Developers see a clear interface in their dashboard:

```
┌─────────────────────────────────────┐
│ Automatic PayPal Payouts            │
├─────────────────────────────────────┤
│ PayPal Email: [input field]         │
│                                     │
│ ☑ Enable Automatic Payouts          │
│                                     │
│ ✓ Automatic Payouts Active          │
│   You'll receive 90% of each sale   │
│   automatically to your@email.com   │
│                                     │
│ How it works:                       │
│ • Payment captured by platform      │
│ • 90% sent to you automatically     │
│ • 5% kept as platform commission    │
│ • Track all payouts in dashboard    │
│                                     │
│ [Save PayPal Settings]              │
└─────────────────────────────────────┘
```

### Tracking Payouts

Developers can track all payouts in their dashboard:
- Transaction history
- Payout amounts
- Payout dates
- PayPal transaction IDs

## API Endpoints

### Set PayPal Credentials

```http
POST /api/developer/paypal
Content-Type: application/json

{
  "paypalEmail": "developer@example.com",
  "paypalEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "paypalEmail": "developer@example.com",
  "paypalEnabled": true
}
```

### Get PayPal Settings

```http
GET /api/developer/paypal
```

**Response:**
```json
{
  "paypalEmail": "developer@example.com",
  "paypalEnabled": true
}
```

## Error Handling

### Payout Failures

If automatic payout fails:
1. Payment is still captured successfully
2. Transaction marked as completed
3. Error logged for admin review
4. Admin can manually process payout
5. Developer notified of issue

### Common Issues

**Issue: Payout fails with "Invalid email"**
- Solution: Verify PayPal email is correct
- Developer must use email associated with PayPal account

**Issue: Payout fails with "Insufficient permissions"**
- Solution: Enable Payouts API in PayPal Developer Dashboard
- Check API credentials have correct permissions

**Issue: Payout delayed**
- Solution: PayPal may hold payouts for review
- Usually resolves within 24 hours
- Check PayPal account status

## Testing

### Sandbox Testing

1. Use PayPal Sandbox accounts
2. Create test buyer and seller accounts
3. Test full purchase flow
4. Verify payout appears in sandbox

```env
NODE_ENV=development
PAYPAL_CLIENT_ID=sandbox-client-id
PAYPAL_CLIENT_SECRET=sandbox-secret
```

### Production Testing

1. Start with small test transaction ($1)
2. Verify payout received
3. Check platform receives 5%
4. Monitor for 24 hours
5. Scale up to full production

## Security Considerations

### PayPal Email Validation

- Basic email format validation
- No storage of PayPal passwords
- Only email addresses stored
- Encrypted in database

### API Security

- PayPal credentials in environment variables
- Never exposed to client
- Secure server-to-server communication
- OAuth 2.0 authentication

### Fraud Prevention

- Verify developer identity
- Monitor unusual payout patterns
- Rate limiting on payout requests
- Transaction logging

## Costs & Fees

### PayPal Fees

PayPal charges fees for payouts:
- **Domestic (US)**: $0.25 per payout
- **International**: 2% (max $20) per payout

**Who pays?**
- Platform absorbs payout fees
- Deducted from 5% platform commission
- Developer receives full 95%

### Example Calculation

```
Bot Price: $100
├─ Developer (95%): $95.00 (sent via payout)
├─ Platform (5%): $5.00
└─ PayPal Payout Fee: -$0.25
    Platform Net: $4.75
```

## Monitoring & Analytics

### Admin Dashboard

Track payout metrics:
- Total payouts sent
- Payout success rate
- Failed payouts
- Average payout amount
- PayPal fees paid

### Developer Dashboard

Developers see:
- Total earnings
- Payouts received
- Pending balance
- Transaction history

## Migration from Manual Payouts

### For Existing Developers

1. Announce new feature
2. Provide setup instructions
3. Allow opt-in (not forced)
4. Support both methods during transition
5. Eventually deprecate manual payouts

### Transition Period

- Keep manual payout system active
- Let developers choose their method
- Gradually migrate developers
- Provide support during transition

## Support & Troubleshooting

### For Developers

**"I didn't receive my payout"**
1. Check PayPal email is correct
2. Check spam folder
3. Verify PayPal account is active
4. Contact platform support

**"How do I change my PayPal email?"**
1. Go to Dashboard → PayPal Settings
2. Update email address
3. Save changes
4. New payouts use new email

### For Platform Admin

**"Payout API returns error"**
1. Check API credentials
2. Verify Payouts API is enabled
3. Check PayPal account status
4. Review API logs

**"Too many failed payouts"**
1. Review error logs
2. Check common failure reasons
3. Contact PayPal support
4. Notify affected developers

## Best Practices

### For Developers

1. Use verified PayPal Business account
2. Keep email address up to date
3. Monitor payout notifications
4. Report issues promptly
5. Maintain good standing

### For Platform

1. Monitor payout success rates
2. Keep PayPal credentials secure
3. Log all payout attempts
4. Provide clear documentation
5. Offer responsive support

## Future Enhancements

Potential improvements:
- Support for Stripe payouts
- Cryptocurrency payouts
- Bank transfer options
- Batch payout processing
- Payout scheduling
- Multi-currency support

## Compliance

### Tax Reporting

- Platform must report payouts to IRS (US)
- Issue 1099-K forms if applicable
- Developers responsible for own taxes
- Keep detailed transaction records

### Legal Requirements

- Terms of Service must cover payouts
- Privacy Policy must cover PayPal data
- Comply with payment regulations
- Follow PayPal's Acceptable Use Policy

---

## Quick Start Checklist

- [ ] Get PayPal Business account
- [ ] Enable Payouts API
- [ ] Get Live API credentials
- [ ] Add credentials to `.env`
- [ ] Run database migration
- [ ] Test with sandbox
- [ ] Test with $1 live transaction
- [ ] Document for developers
- [ ] Launch feature
- [ ] Monitor payouts

## Support

For issues or questions:
- Email: support@braininspirednetwork.cloud
- Documentation: /docs/automatic-payouts
- PayPal Support: https://www.paypal.com/support
