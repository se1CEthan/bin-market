# Deployment Guide - BIN Marketplace

This guide covers deploying your bot marketplace to various third-party platforms.

## Prerequisites

1. **PostgreSQL Database** - You'll need a PostgreSQL database. Options include:
   - [Neon](https://neon.tech) - Serverless PostgreSQL (Free tier available)
   - [Supabase](https://supabase.com) - PostgreSQL with additional features
   - [Railway](https://railway.app) - PostgreSQL hosting
   - [ElephantSQL](https://www.elephantsql.com) - PostgreSQL as a service
   - Self-hosted PostgreSQL

2. **Node.js 20+** installed on your deployment platform

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random string for session encryption

Optional (for full functionality):
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For OAuth login
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` - For payments

## Database Setup

1. Install dependencies:
```bash
npm install
```

2. Push database schema:
```bash
npm run db:push
```

## Deployment Platforms

### Option 1: Vercel (Recommended for Frontend + Serverless)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

Note: You'll need to configure PostgreSQL connection pooling for serverless.

### Option 2: Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database service
4. Connect GitHub repo or deploy via CLI
5. Add environment variables
6. Railway will auto-detect and build your app

### Option 3: Render

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add PostgreSQL database (or use external)
6. Set environment variables

### Option 4: DigitalOcean App Platform

1. Create account at [digitalocean.com](https://www.digitalocean.com)
2. Create new App
3. Connect repository
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

### Option 5: AWS (EC2 + RDS)

1. Launch EC2 instance (Ubuntu 22.04 recommended)
2. Create RDS PostgreSQL instance
3. SSH into EC2 and clone repository
4. Install Node.js 20+
5. Configure `.env` with RDS connection string
6. Run:
```bash
npm install
npm run build
npm start
```

7. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "bin-marketplace" -- start
pm2 save
pm2 startup
```

### Option 6: Docker

Build and run with Docker:

```bash
docker build -t bin-marketplace .
docker run -p 5000:5000 --env-file .env bin-marketplace
```

## Post-Deployment

1. **Test authentication** - Verify Google OAuth works with production callback URL
2. **Test payments** - Verify PayPal integration in production mode
3. **Upload test bot** - Ensure file uploads work correctly
4. **Check WebSocket** - Verify real-time chat functionality
5. **Monitor logs** - Check for any errors

## Production Checklist

- [ ] Set strong `SESSION_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Update Google OAuth callback URL to production domain
- [ ] Switch PayPal to production credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set up database backups
- [ ] Configure file storage (consider S3 for uploads)
- [ ] Set up monitoring and logging

## Troubleshooting

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check if database allows connections from your deployment IP
- For serverless: Enable connection pooling

**OAuth not working:**
- Update callback URL in Google Console to match production domain
- Verify credentials are set correctly

**File uploads not persisting:**
- Consider using cloud storage (AWS S3, Cloudinary) instead of local filesystem
- Ensure uploads directory has write permissions

## Support

For issues, check the logs and verify all environment variables are set correctly.
