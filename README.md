=======
# BIN (Brain Inspired Network) - Bot Marketplace

A fully functional dark-themed bot marketplace where users can browse, buy, and download automation bots. Developers can upload and sell bots while keeping 90% of sales revenue.

## Features

- 🔐 Google OAuth authentication
- 💳 PayPal payment integration
- 👨‍💻 Developer dashboard with bot management
- 👑 Admin dashboard for platform management
- 💬 Real-time WebSocket chat
- ⭐ Reviews and ratings system
- 📊 Sales analytics and tracking
- 🎨 Modern dark theme UI

## Tech Stack

- **Frontend**: React, Wouter, TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express, TypeScript, PassportJS
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: PayPal SDK
- **Real-time**: WebSocket

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

You need a PostgreSQL database. Options:
- Local PostgreSQL
- [Neon](https://neon.tech) (Free serverless PostgreSQL)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bin_marketplace
```

### 4. Initialize Database

Push the database schema:

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random string for session encryption

### Optional (for full functionality)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL (default: http://localhost:5000/api/auth/google/callback)
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret

## Database Scripts

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Production Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms:
- Vercel
- Railway
- Render
- DigitalOcean
- AWS
- Docker

## Project Structure

```
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── uploads/             # File uploads directory
```

## Key Features Explained

### Authentication
- Google OAuth for secure login
- Session-based authentication
- Optional during development (can be disabled)

### Bot Marketplace
- Browse and search bots
- Filter by category
- View bot details and reviews
- Purchase and download bots

### Developer Dashboard
- Upload new bots with files and thumbnails
- Track sales and earnings
- Manage bot listings
- 90% revenue share

### Admin Dashboard
- Manage featured bots
- View platform statistics
- Moderate content

### Payment System
- PayPal integration
- Secure checkout flow
- Automatic revenue distribution

## Development Notes

- The app runs on port 5000 by default
- WebSocket server runs on `/ws` path
- Uploaded files are stored in `uploads/` directory
- Google OAuth is optional during development

## Troubleshooting

**Database connection error:**
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

**OAuth not working:**
- Set up Google OAuth credentials in Google Cloud Console
- Update callback URL to match your domain
- Ensure credentials are in `.env`

**File uploads failing:**
- Check `uploads/` directory exists and is writable
- For production, consider using cloud storage (S3, Cloudinary)

## License

MIT
>>>>>>> 510d49c (first commit)
