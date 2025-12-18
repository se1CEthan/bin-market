# BIN (Brain Inspired Network) - Bot Marketplace

## Project Overview
BIN is a fully functional dark-themed bot marketplace where users can browse, buy, and download automation bots. Developers can upload and sell bots while keeping 95% of sales revenue. The platform includes Google OAuth authentication, PayPal payment integration, developer and admin dashboards, real-time WebSocket chat, and is production-ready.

## Recent Changes (November 16, 2025)
- ✅ **Disconnected from Replit** - Removed all Replit-specific dependencies
- ✅ **Standard PostgreSQL** - Replaced Neon serverless with standard node-postgres
- ✅ **Environment Variables** - Added dotenv support with .env file
- ✅ **Docker Support** - Added Dockerfile and docker-compose.yml
- ✅ **Deployment Ready** - Can now deploy to any platform (Vercel, Railway, Render, AWS, etc.)
- ✅ **Local Development** - Added setup script for local PostgreSQL
- ✅ **Documentation** - Added comprehensive README.md and DEPLOYMENT.md

## Tech Stack
- **Frontend**: React 18.3.1, Wouter (routing), TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express, TypeScript, PassportJS (Google OAuth)
- **Database**: PostgreSQL (Neon-backed) with Drizzle ORM
- **Payments**: PayPal SDK integration
- **Real-time**: WebSocket server on `/ws` path
- **File Storage**: Local uploads in `server/uploads` directory

## Project Architecture

### Database Schema (`shared/schema.ts`)
- **users**: id, email, name, googleId, avatarUrl, isDeveloper, isAdmin
- **bots**: id, name, description, price, fileUrl, thumbnailUrl, categoryId, developerId, downloadCount, rating
- **categories**: id, name, description, iconName
- **purchases**: id, userId, botId, amount, paypalOrderId, status, purchaseDate
- **reviews**: id, botId, userId, rating, comment, createdAt
- **messages**: id, senderId, recipientId, content, isRead, createdAt
- **featuredBots**: id, botId, position, createdAt

### Key Features
1. **Authentication**: Google OAuth only (optional during development)
2. **Bot Marketplace**: Browse, search, filter bots by category
3. **Developer Dashboard**: Upload bots, track sales, manage earnings
4. **Admin Dashboard**: Manage featured bots, view stats, moderate content
5. **Payment Integration**: PayPal checkout with 95% revenue share for developers
6. **Real-time Chat**: WebSocket-based messaging between users and developers
7. **Reviews & Ratings**: Users can rate and review purchased bots

### Frontend Pages
- `/` - Home page with trending bots and categories
- `/bots` - Bot listing with filters
- `/bots/:id` - Bot detail page
- `/account` - User account page
- `/account/purchases` - Purchase history
- `/developer/dashboard` - Developer stats and bot management
- `/developer/upload` - Upload new bot
- `/admin/dashboard` - Admin panel (admin users only)

### API Endpoints (`server/routes.ts`)
- **Auth**: `/api/auth/google`, `/api/auth/google/callback`, `/api/auth/me`, `/api/auth/logout`
- **Bots**: `/api/bots`, `/api/bots/trending`, `/api/bots/:id`
- **Categories**: `/api/categories`
- **Purchases**: `/api/purchases`, `/api/purchases/create-order`, `/api/purchases/capture-order`
- **Reviews**: `/api/reviews/:botId`, `/api/reviews` (POST)
- **Messages**: `/api/messages`, `/api/messages/send`
- **Developer**: `/api/developer/bots`, `/api/developer/upload`
- **Admin**: `/api/admin/featured-bots`
- **Stats**: `/api/stats`

### Design Guidelines (`design_guidelines.md`)
- Dark theme with cyan accents (primary color: hsl(180, 100%, 50%))
- Font stack: Space Grotesk (headlines), Inter (body), JetBrains Mono (pricing)
- Marketplace hybrid approach inspired by Gumroad, Stripe, and Linear
- Clean, modern UI with subtle elevation interactions

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional during development)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional during development)
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal client secret

## Development

### Running the Project
```bash
npm run dev
```
This starts both the Express backend and Vite frontend on port 5000.

### Database Operations
- Push schema changes: `npm run db:push`
- Generate migrations: `npm run db:generate`
- Studio (GUI): `npm run db:studio`

### Known Issues
- Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to be set for authentication to work
- Currently running with optional Google OAuth for development purposes
- WebSocket server runs on `/ws` path (separate from Vite HMR)

## User Preferences
- Prefer dark theme design
- Use Google OAuth exclusively for authentication (no Replit Auth or third-party alternatives)
- PayPal for payments (95% revenue share for developers)
- Production-ready features required
