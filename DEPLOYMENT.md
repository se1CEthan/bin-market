# 🚀 BIN Marketplace - Production Deployment Guide

## ✅ Cryptomus-Only Payment System

BIN now uses **Cryptomus exclusively** for crypto payments, providing secure and reliable cryptocurrency payment processing.

## 🔧 Required Environment Variables

### Essential Variables (Required)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters

# Cryptomus Configuration (Primary Payment Method)
CRYPTOMUS_API_KEY=your-cryptomus-api-key
CRYPTOMUS_MERCHANT_ID=your-cryptomus-merchant-id
CRYPTOMUS_WEBHOOK_SECRET=your-cryptomus-webhook-secret

# Application URLs
FRONTEND_URL=https://www.braininspirednetwork.cloud

# Server Configuration
PORT=5000
NODE_ENV=production
```

### Optional Variables
```bash
# PayPal Configuration (Legacy - for existing transactions only)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PLATFORM_PAYPAL_EMAIL=your-platform-paypal-email@domain.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://www.braininspirednetwork.cloud/api/auth/google/callback

# Email Service (optional - emails will be logged if not configured)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🏗️ Deployment Steps

### 1. Database Setup
```bash
# Deploy database schema
npm run db:push

# Seed initial categories
npm run seed:categories
```

### 2. Cryptomus Configuration

#### Get Cryptomus Credentials:
1. Go to [Cryptomus Dashboard](https://cryptomus.com/)
2. Create a merchant account
3. Generate API key and get Merchant ID
4. Set webhook URL: `https://www.braininspirednetwork.cloud/api/cryptomus/webhook`
5. Generate webhook secret for security

#### Environment Setup:
```bash
CRYPTOMUS_API_KEY=your_api_key_here
CRYPTOMUS_MERCHANT_ID=your_merchant_id_here
CRYPTOMUS_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Platform-Specific Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push

### Railway.app
1. Connect GitHub repository
2. Add environment variables
3. Deploy with one click

### Vercel/Netlify
1. Connect repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Docker Deployment
```dockerfile
# Use the provided Dockerfile
docker build -t bin-marketplace .
docker run -p 5000:5000 --env-file .env bin-marketplace
```

## 🔒 Security Checklist

### Required Security Settings:
- ✅ Strong SESSION_SECRET (32+ characters)
- ✅ HTTPS enabled in production
- ✅ Secure database connection
- ✅ Cryptomus webhook verification
- ✅ Environment variables secured

### Database Security:
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention with Drizzle ORM
- ✅ Secure session storage

## 📧 Email Configuration (Optional)

### Gmail Setup:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in EMAIL_PASSWORD

### Custom SMTP:
```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## 🎯 Payment Flow

### User Experience:
1. **Browse** → User browses bot listings
2. **Purchase** → User clicks "Buy Now"
3. **Cryptomus** → Redirected to Cryptomus crypto payment
4. **Payment** → Completes payment with cryptocurrency
5. **Return** → Redirected back to marketplace
6. **Access** → Receives email with license key and download link

### Technical Flow:
1. `POST /api/crypto/create-invoice` - Creates Cryptomus invoice
2. User completes payment with crypto
3. `POST /api/cryptomus/webhook` - Webhook confirms payment
4. License key generated automatically
5. Email sent with download instructions
6. User can download bot files

## 🧪 Testing

### Test Cryptomus Integration:
1. Use Cryptomus test environment
2. Create test payment
3. Complete test crypto transaction
4. Verify license generation
5. Test download functionality

### Test User Flow:
1. Register new account
2. Verify email (check logs if email not configured)
3. Browse bots
4. Complete purchase with PayPal
5. Check email for license key
6. Download bot files

## 📊 Monitoring

### Key Metrics to Monitor:
- User registrations
- Payment completions
- License generations
- Download success rates
- Error rates

### Log Files:
- Application logs: Check for errors
- PayPal webhooks: Verify payment processing
- Email delivery: Confirm notifications sent

## 🚨 Troubleshooting

### Common Issues:

#### Cryptomus Invoice Creation Fails:
- Check CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID
- Verify Cryptomus merchant account is active
- Check network connectivity
- Ensure webhook URL is correctly configured

#### Email Not Sending:
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check Gmail app password setup
- Emails will be logged to console if not configured

#### Database Connection Issues:
- Verify DATABASE_URL format
- Check database server status
- Ensure database exists and is accessible

#### Session Issues:
- Verify SESSION_SECRET is set
- Check database session table exists
- Clear browser cookies

## 🎉 Success Indicators

### Deployment Successful When:
- ✅ Server starts without errors
- ✅ Database connection established
- ✅ Cryptomus invoices can be created
- ✅ Users can register and login
- ✅ Email notifications work (or log properly)
- ✅ Bot purchases complete successfully with crypto
- ✅ License keys generate correctly
- ✅ Download links work

## 📞 Support

### If You Need Help:
1. Check server logs for errors
2. Verify all environment variables
3. Test Cryptomus integration
4. Check database connectivity
5. Review email configuration

### Common Commands:
```bash
# Check logs
npm run dev  # Development mode with detailed logs

# Database operations
npm run db:push  # Update database schema

# Seed data
npm run seed:categories  # Add bot categories
```

---

## 🎯 Final Notes

BIN is now **production-ready** with:
- ✅ Cryptomus crypto payment processing
- ✅ Real user authentication
- ✅ Email verification system
- ✅ License generation and delivery
- ✅ Secure download system
- ✅ Professional UI/UX
- ✅ Automatic crypto payouts to developers

**The marketplace is ready for real users and real crypto transactions!** 🚀