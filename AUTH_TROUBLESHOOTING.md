# Authentication Troubleshooting Guide

## "Bad Request" Error on Sign In

If you're getting a "Bad request" error when clicking "Sign In" or "Get Started", here are the common causes and solutions:

### 1. Google OAuth Configuration Issues

**Check Google Cloud Console:**

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", make sure you have:
   ```
   https://braininspirednetwork.cloud/api/auth/google/callback
   ```

**Important:** The redirect URI must match EXACTLY (including https://)

### 2. Environment Variable Mismatch

Your `.env` file should have:

```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://braininspirednetwork.cloud/api/auth/google/callback
```

**For Render deployment:**
1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Make sure these variables are set:
   - `NODE_ENV` = `production`
   - `GOOGLE_CLIENT_ID` = (your client ID)
   - `GOOGLE_CLIENT_SECRET` = (your secret)
   - `GOOGLE_CALLBACK_URL` = `https://braininspirednetwork.cloud/api/auth/google/callback`

### 3. Session Cookie Issues

The session configuration needs to match your environment:

**For Production (Render):**
- `secure: true` (HTTPS required)
- `sameSite: 'none'` (for OAuth redirects)
- `domain: '.braininspirednetwork.cloud'`

**For Local Development:**
- `secure: false` (HTTP allowed)
- `sameSite: 'lax'`
- `domain: undefined`

The code now automatically adjusts based on `NODE_ENV`.

### 4. Database Session Table

Make sure the session table exists in your database:

```sql
-- Check if session table exists
SELECT * FROM pg_tables WHERE tablename = 'session';
```

If it doesn't exist, the app should create it automatically on first run.

### 5. CORS Issues

If you're getting CORS errors, check that:
- Your domain is correctly configured
- The OAuth callback URL matches exactly
- Cookies are being sent with requests

## Quick Fix Steps

### Step 1: Update Environment Variables on Render

1. Go to Render Dashboard
2. Your web service → Environment
3. Update or add:
   ```
   NODE_ENV=production
   ```
4. Save (this will trigger a redeploy)

### Step 2: Verify Google OAuth Settings

1. Google Cloud Console → APIs & Services → Credentials
2. Your OAuth 2.0 Client ID
3. Authorized redirect URIs should include:
   ```
   https://braininspirednetwork.cloud/api/auth/google/callback
   ```
4. Save changes

### Step 3: Test Authentication

1. Clear your browser cookies for braininspirednetwork.cloud
2. Try signing in again
3. Check browser console for errors
4. Check Render logs for server errors

## Testing Locally

If you want to test locally:

1. Update `.env`:
   ```env
   NODE_ENV=development
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

2. Add to Google OAuth authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Common Error Messages

### "Bad request"
- **Cause:** OAuth callback URL mismatch
- **Fix:** Verify Google Console redirect URI matches your callback URL exactly

### "redirect_uri_mismatch"
- **Cause:** The redirect URI in the request doesn't match any registered URIs
- **Fix:** Add the exact callback URL to Google Console

### "Authentication required"
- **Cause:** Session not being saved/retrieved
- **Fix:** Check database connection and session table

### "Google OAuth not configured"
- **Cause:** Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET
- **Fix:** Add credentials to environment variables

## Debugging Tips

### Check Server Logs on Render

1. Go to Render Dashboard
2. Your web service → Logs
3. Look for authentication-related errors
4. Check for session errors

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking "Sign In"
4. Check Network tab for failed requests

### Test OAuth Flow Manually

1. Visit: `https://braininspirednetwork.cloud/api/auth/google`
2. Should redirect to Google sign-in
3. After signing in, should redirect back to your site
4. If it fails, note the error message

## Still Having Issues?

### Verify All Settings

Run this checklist:

- [ ] `NODE_ENV=production` in Render environment variables
- [ ] Google OAuth redirect URI includes your domain
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] `GOOGLE_CALLBACK_URL` matches Google Console exactly
- [ ] Database is accessible and session table exists
- [ ] Site is accessible via HTTPS
- [ ] Cookies are enabled in browser

### Get More Information

Add logging to see what's happening:

1. Check Render logs during sign-in attempt
2. Look for "Auth callback" messages
3. Check for session ID in logs
4. Verify user authentication status

### Contact Support

If still not working, provide:
- Error message from browser console
- Error from Render logs
- Your Google OAuth callback URL
- Your domain name
- Screenshot of the error

## Prevention

To avoid this issue in the future:

1. Always set `NODE_ENV=production` on Render
2. Keep Google OAuth redirect URIs updated
3. Test authentication after any domain changes
4. Monitor Render logs for auth errors
5. Keep environment variables in sync

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Express Session Documentation](https://github.com/expressjs/session)
