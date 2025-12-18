# Quick Start Guide

Get BIN Marketplace running in 5 minutes!

## Option 1: Docker (Easiest)

If you have Docker installed:

```bash
# Start everything (PostgreSQL + App)
docker-compose up

# In another terminal, initialize the database
docker-compose exec app npm run db:push
```

Visit `http://localhost:5000` 🎉

## Option 2: Local PostgreSQL

### Step 1: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Arch Linux:**
```bash
sudo pacman -S postgresql
sudo systemctl start postgresql
```

### Step 2: Create Database

Run the setup script:
```bash
./setup-local-db.sh
```

Or manually:
```bash
sudo -u postgres psql
CREATE DATABASE bin_marketplace;
CREATE USER bin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bin_marketplace TO bin_user;
\q
```

### Step 3: Configure Environment

Edit `.env` file:
```env
DATABASE_URL=postgresql://bin_user:your_password@localhost:5432/bin_marketplace
SESSION_SECRET=your-random-secret-key
```

### Step 4: Initialize & Run

```bash
npm install
npm run db:push
npm run dev
```

Visit `http://localhost:5000` 🎉

## Option 3: Cloud Database (Neon - Free)

### Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string

### Step 2: Configure

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-random-secret-key
```

### Step 3: Run

```bash
npm install
npm run db:push
npm run dev
```

Visit `http://localhost:5000` 🎉

## Next Steps

### Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Enable PayPal (Optional)

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a sandbox app
3. Get credentials
4. Add to `.env`:
```env
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
```

## Troubleshooting

**Port 5000 already in use:**
```bash
# Change port in .env
PORT=3000
```

**Database connection error:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL is correct
- Test connection: `psql "your-database-url"`

**npm install fails:**
- Use Node.js 20+: `node --version`
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`

## Development Tips

- View database: `npm run db:studio`
- Check logs: Look at terminal output
- Hot reload: Changes auto-refresh in dev mode
- API testing: Use `http://localhost:5000/api/...`

## Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guides.
