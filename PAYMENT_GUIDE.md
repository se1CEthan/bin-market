# Payment System Guide - Brain Inspired Network

## 💳 How Payments Work

### Current Setup: Manual Payout System

Your marketplace uses **PayPal** for payments with a **90/10 revenue split**:
- **Developer gets**: 90% of sale price
- **Platform (you) gets**: 10% of sale price

## 🔄 Payment Flow

### 1. Buyer Purchases Bot
```
Buyer clicks "Buy Now" 
    ↓
PayPal checkout opens
    ↓
Buyer pays with PayPal/Credit Card
    ↓
Full amount goes to YOUR PayPal account
    ↓
Transaction recorded in database with split:
  - Platform Fee (10%)
  - Developer Earnings (90%)
```

### 2. Developer Requests Payout
```
Developer goes to Dashboard
    ↓
Clicks "Request Payout"
    ↓
Enters PayPal email
    ↓
Request appears in Admin Dashboard
    ↓
You manually send payment via PayPal
```

## 💰 Your PayPal Configuration

**Current PayPal Credentials:**
- Client ID: `AX3cNnccYvsbhkIlbI_WgGdaSl1wUXsKFdSDDguk2rt8vbhrfvHPTrfRfy5WNWR6ajSTOPbI8E41pYxI`
- Environment: **Sandbox** (Test mode)

⚠️ **Important**: You're currently in **SANDBOX mode** (test). No real money is being processed!

## 🚀 Going Live with Real Payments

### Step 1: Get Production PayPal Credentials

1. Go to https://developer.paypal.com/
2. Log in with your PayPal Business account
3. Go to **My Apps & Credentials**
4. Switch to **Live** tab
5. Create a new app or use existing
6. Copy your **Live Client ID** and **Secret**

### Step 2: Update Environment Variables

Update your `.env` file and Render environment variables:

```env
# Replace with LIVE credentials
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_secret_here
NODE_ENV=production
```

### Step 3: Update in Render

1. Go to Render dashboard
2. Your web service → **Environment** tab
3. Update `PAYPAL_CLIENT_ID` with live credentials
4. Update `PAYPAL_CLIENT_SECRET` with live credentials
5. Save changes (auto-redeploys)

## 📊 Managing Payouts

### View Pending Payouts

1. Go to **Admin Dashboard**
2. Click **Payouts** tab
3. See all payout requests from developers

### Process a Payout

**Manual Method (Current):**

1. Developer requests payout in their dashboard
2. You see request in Admin Dashboard with:
   - Developer name
   - Amount owed (90% of their sales)
   - PayPal email
   - Request date

3. **Send payment manually:**
   - Log in to PayPal.com
   - Click "Send & Request"
   - Enter developer's PayPal email
   - Enter amount (90% of their sales)
   - Add note: "BIN Marketplace - Bot Sales Payout"
   - Send payment

4. **Mark as paid in Admin Dashboard:**
   - Click "Mark as Paid"
   - Status changes to "Paid"
   - Developer sees payment in their dashboard

### Payout Schedule

**Recommended:**
- Process payouts weekly or bi-weekly
- Minimum payout: $50 (to reduce fees)
- Notify developers of payout schedule

## 💡 Automatic Payouts (Future Enhancement)

To automate payouts, you would need to:

1. **Use PayPal Payouts API**
   - Requires PayPal Business account
   - Additional API permissions
   - Batch payout capability

2. **Implementation:**
   ```typescript
   // Pseudo-code for automatic payouts
   async function processAutomaticPayouts() {
     const pendingPayouts = await getPendingPayouts();
     
     for (const payout of pendingPayouts) {
       await paypalPayoutsAPI.sendPayment({
         email: payout.paypalEmail,
         amount: payout.amount,
         currency: 'USD',
         note: 'BIN Marketplace Payout'
       });
       
       await markPayoutAsPaid(payout.id);
     }
   }
   ```

3. **Run weekly via cron job**

## 📈 Revenue Tracking

### Your Earnings (5%)

**View in Admin Dashboard:**
- Total platform revenue
- Revenue by month
- Revenue by bot category

**Calculate manually:**
```
Your Earnings = Total Sales × 0.05
```

Example:
- Total sales: $1,000
- Your cut: $1,000 × 0.05 = $50
- Developer cut: $1,000 × 0.90 = $900

### Developer Earnings (90%)

**Developers see in their dashboard:**
- Total earnings
- Pending balance
- Paid out amount
- Request payout button

## 🔒 Security Best Practices

### Protect PayPal Credentials

1. **Never commit to Git:**
   - Already in `.gitignore`
   - Only in environment variables

2. **Use environment variables:**
   - Local: `.env` file
   - Production: Render dashboard

3. **Rotate credentials:**
   - Change every 6 months
   - Change if compromised

### Verify Transactions

1. **Always verify in PayPal:**
   - Check PayPal dashboard
   - Match transaction IDs
   - Verify amounts

2. **Keep records:**
   - Export transaction reports monthly
   - Save payout receipts
   - Document disputes

## 📝 Transaction Records

### What's Stored in Database

For each purchase:
```javascript
{
  id: "transaction-id",
  buyerId: "user-id",
  botId: "bot-id",
  developerId: "developer-id",
  amount: "29.99",           // Full price
  platformFee: "3.00",       // 10% (your cut)
  developerEarnings: "26.99", // 90% (developer cut)
  paypalOrderId: "paypal-order-id",
  status: "completed",
  createdAt: "2024-11-17"
}
```

### Export Reports

**Monthly Revenue Report:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount::numeric) as total_sales,
  SUM(platform_fee::numeric) as platform_revenue,
  SUM(developer_earnings::numeric) as developer_payouts
FROM transactions
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

## 🎯 Payout Workflow Example

### Scenario: Developer Makes $500 in Sales

1. **Week 1-4**: Developer sells bots
   - Total sales: $500
   - Platform fee (10%): $50 (goes to you)
   - Developer earnings (90%): $450

2. **End of Month**: Developer requests payout
   - Goes to Dashboard → Payouts
   - Clicks "Request Payout"
   - Enters PayPal email: dev@example.com
   - Submits request

3. **You Process Payout**:
   - See request in Admin Dashboard
   - Log in to PayPal
   - Send $475 to dev@example.com
   - Mark as paid in dashboard

4. **Developer Receives Payment**:
   - Gets PayPal notification
   - Sees "Paid" status in dashboard
   - Can request new payout next month

## 💳 Payment Methods Supported

### Current: PayPal Only

**Buyers can pay with:**
- PayPal balance
- Credit/Debit cards (via PayPal)
- Bank account (via PayPal)

**Developers receive via:**
- PayPal only

### Future: Add More Options

**Potential additions:**
- Stripe (credit cards directly)
- Crypto payments
- Bank transfers
- Wise/TransferWise

## 🚨 Common Issues

### Issue: Payment Not Showing in Database

**Solution:**
1. Check PayPal dashboard for transaction
2. Verify webhook is working
3. Check server logs for errors
4. Manually create transaction record if needed

### Issue: Developer Not Receiving Payout

**Solution:**
1. Verify PayPal email is correct
2. Check PayPal for payment status
3. Ask developer to check spam folder
4. Resend payment if failed

### Issue: Buyer Wants Refund

**Solution:**
1. Check refund policy (within 7 days)
2. Verify purchase in database
3. Issue refund via PayPal
4. Update transaction status to "refunded"
5. Deduct from developer's next payout

## 📞 Support

### For Payment Issues

**Buyers:**
- Email: support@braininspirednetwork.cloud
- Response time: 24 hours

**Developers:**
- Email: payouts@braininspirednetwork.cloud
- Payout questions: 24 hours
- Technical issues: 48 hours

## ✅ Pre-Launch Checklist

Before going live with real payments:

- [ ] Switch to PayPal Live credentials
- [ ] Test a real $1 transaction
- [ ] Verify money reaches your PayPal
- [ ] Test payout process
- [ ] Set up payout schedule
- [ ] Create refund policy
- [ ] Set up payment notifications
- [ ] Document payout process
- [ ] Train on dispute handling
- [ ] Set up accounting system

## 📊 Recommended Tools

### Accounting
- QuickBooks (track revenue)
- Wave (free accounting)
- Excel/Google Sheets (simple tracking)

### Payment Tracking
- PayPal reports (built-in)
- Your admin dashboard
- Monthly export to spreadsheet

### Tax Preparation
- Consult with accountant
- Track all transactions
- Save PayPal statements
- Document business expenses

---

**Remember**: You're currently in **SANDBOX mode**. Switch to **LIVE credentials** when ready to accept real payments!
