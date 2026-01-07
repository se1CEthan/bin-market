import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const PgSession = connectPgSimple(session);

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

const isProd = process.env.NODE_ENV === 'production';

// Session configuration with PostgreSQL store
// Only trust proxy when running in production behind a reverse proxy
if (isProd) {
  app.set('trust proxy', 1); // Trust Render's proxy
}
const frontendUrl = process.env.FRONTEND_URL || '';
let cookieDomain: string | undefined = undefined;
try {
  if (isProd && frontendUrl) {
    const url = new URL(frontendUrl);
    // Use root domain for cookie (strip www)
    cookieDomain = url.hostname.startsWith('www.') ? `.${url.hostname.replace(/^www\./, '')}` : url.hostname;
  }
} catch (err) {
  // ignore
}

console.log('Session cookie config:', { isProd, cookieDomain, frontendUrl });

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: isProd, // Enable proxy handling only in production
  cookie: {
    secure: isProd, // secure cookies in production only
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProd ? 'none' : 'lax', // 'none' for production, 'lax' for dev
    domain: cookieDomain,
  },
}));

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('🚀 Starting BIN Marketplace server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔌 Port: ${process.env.PORT || '5000'}`);
    
    // Test database connection
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw dbError;
    }

    const server = await registerRoutes(app);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      port: process.env.PORT || '5000'
    });
  });

  // Debug endpoint to inspect session and cookies (safe for local testing only)
  app.get('/api/debug/session', (req, res) => {
    try {
      res.json({
        sessionID: req.sessionID,
        cookies: req.headers.cookie || null,
        sessionCookie: req.session?.cookie || null,
        user: req.user || null,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to read session' });
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Server successfully started on port ${port}`);
    log(`🌐 Environment: ${process.env.NODE_ENV}`);
    log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    log(`🔑 Session secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
  });

  // Handle server errors
  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
})();
