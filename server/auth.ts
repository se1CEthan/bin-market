import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Express } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

const isGoogleAuthConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET;

if (!isGoogleAuthConfigured) {
  console.warn('Warning: Google OAuth credentials not configured. Authentication will not work.');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          let user = await storage.getUserByGoogleId(profile.id);

          if (!user) {
            user = await storage.getUserByEmail(email);
            if (user) {
              user = await storage.updateUser(user.id, { googleId: profile.id });
            }
          }

          if (!user) {
            user = await storage.createUser({
              email,
              name: profile.displayName || email.split('@')[0],
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || null,
              isDeveloper: false,
              isAdmin: false,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  if (isGoogleAuthConfigured) {
    app.get('/api/auth/google', (req, res, next) => {
      // Store user type and PayPal email in session for callback
      if (req.query.userType) {
        (req.session as any).pendingUserType = req.query.userType;
      }
      if (req.query.paypalEmail) {
        (req.session as any).pendingPaypalEmail = req.query.paypalEmail;
      }
      
      passport.authenticate('google', {
        scope: ['profile', 'email'],
      })(req, res, next);
    });

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      async (req, res) => {
        console.log('Auth callback - User:', req.user ? 'authenticated' : 'not authenticated');
        console.log('Auth callback - Session ID:', req.sessionID);
        
        // Check if user selected developer role during signup
        const pendingUserType = (req.session as any).pendingUserType;
        const pendingPaypalEmail = (req.session as any).pendingPaypalEmail;
        
        if (req.user && pendingUserType === 'developer') {
          const userId = (req.user as any).id;
          const updates: any = { isDeveloper: true };
          
          if (pendingPaypalEmail) {
            updates.paypalEmail = pendingPaypalEmail;
            updates.paypalEnabled = true;
          }
          
          await storage.updateUser(userId, updates);
          console.log('User upgraded to developer with PayPal:', pendingPaypalEmail || 'none');
        }
        
        // Clear pending data from session
        delete (req.session as any).pendingUserType;
        delete (req.session as any).pendingPaypalEmail;
        
        res.redirect('/');
      }
    );
  } else {
    app.get('/api/auth/google', (req, res) => {
      res.status(503).json({ error: 'Google OAuth not configured' });
    });
  }

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    console.log('Auth check - User:', req.user ? 'authenticated' : 'not authenticated');
    console.log('Auth check - Session ID:', req.sessionID);
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

export function requireDeveloper(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.isDeveloper) {
    return next();
  }
  res.status(403).json({ error: 'Developer access required' });
}

export function requireAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}
