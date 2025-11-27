# Render 502 Bad Gateway - Troubleshooting Guide

## Current Issue
Your site is showing a 502 Bad Gateway error after the latest deployment.

## Likely Causes

### 1. Database Schema Mismatch
The recent addition of `isVerifiedSeller` field requires a database migration.

**Fix:**
```bash
# Option A: Run migration manually
npm run db:push

# Option B: Add migration to build command in Render
# Build Command: npm install && npm run build && npm run db:push
```

### 2. Service Crash on Startup
Check Render logs for errors.

**Steps:**
1. Go to Render Dashboard
2. Your service → Logs
3. Look for error messages
4. Common errors:
   - Database connection failed
   - Missing environment variables
   - TypeScript compilation errors

### 3. Database Connection Issues
The service can't connect to the database.

**Fix:**
1. Verify `DATABASE_URL` in Render environment variables
2. Check if database is running
3. Verify SSL settings

## Quick Fixes

### Fix 1: Rollback to Previous Version
If you need the site up immediately:

1. Go to Render Dashboard
2. Your service → Events
3. Find the last successful deployment
4. Click "Rollback to this version"

### Fix 2: Manual Database Migration
The `isVerifiedSeller` column needs to be added:

```sql
-- Run this in your database console
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT FALSE NOT NULL;
```

### Fix 3: Update Build Command
In Render Dashboard:

1. Go to your service → Settings
2. Update Build Command to:
   ```
   npm install && npm run build && npm run db:push
   ```
3. This ensures database is migrated on each deploy

### Fix 4: Check Environment Variables
Ensure these are set in Render:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://braininspirednetwork.cloud/api/auth/google/callback
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NODE_ENV=production
```

## Debugging Steps

### 1. Check Render Logs
```
Render Dashboard → Your Service → Logs
```

Look for:
- `Error:` messages
- `Failed to` messages
- Stack traces
- Database connection errors

### 2. Check Build Logs
```
Render Dashboard → Your Service → Events → Latest Deploy
```

Look for:
- TypeScript errors
- Missing dependencies
- Build failures

### 3. Test Database Connection
In Render Shell:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### 4. Check Service Status
```
Render Dashboard → Your Service → Overview
```

Should show: "Live" (green)
If showing: "Build failed" or "Deploy failed" (red)

## Common Error Messages

### "column users.is_verified_seller does not exist"
**Solution:** Run database migration
```bash
npm run db:push
```

### "connect ECONNREFUSED"
**Solution:** Database connection issue
- Check DATABASE_URL
- Verify database is running
- Check firewall/network settings

### "Cannot find module"
**Solution:** Dependency issue
- Clear build cache in Render
- Redeploy

### "Port 10000 is already in use"
**Solution:** Service restart issue
- Render will handle this automatically
- Wait 2-3 minutes

## Prevention

### 1. Always Test Locally First
```bash
# Test schema changes
npm run db:push

# Test build
npm run build

# Test server
npm start
```

### 2. Use Staging Environment
- Create a staging service on Render
- Test changes there first
- Then deploy to production

### 3. Database Migrations
For schema changes, always:
1. Test migration locally
2. Backup production database
3. Run migration
4. Deploy code

## Recovery Steps (In Order)

1. **Check Logs** (2 minutes)
   - Identify the exact error

2. **Try Manual Migration** (5 minutes)
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT FALSE NOT NULL;
   ```

3. **Redeploy** (5 minutes)
   - Trigger manual deploy in Render
   - Wait for build to complete

4. **Rollback if Needed** (2 minutes)
   - Use Render's rollback feature
   - Site will be back up immediately

5. **Fix and Redeploy** (varies)
   - Fix the issue locally
   - Test thoroughly
   - Deploy again

## Current Status Check

Run these commands to check status:

```bash
# Check if site is accessible
curl -I https://braininspirednetwork.cloud

# Check if API is working
curl https://braininspirednetwork.cloud/api/stats

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## Need Immediate Help?

1. **Rollback** to last working version (fastest)
2. **Check Render Status Page**: https://status.render.com
3. **Contact Render Support** if platform issue

## After Recovery

1. Review what caused the issue
2. Add safeguards (staging environment)
3. Document the fix
4. Update deployment process

---

**Next Steps:**
1. Check Render logs NOW
2. Run database migration
3. Redeploy or rollback
4. Monitor for 10 minutes

The site should be back up within 10-15 minutes following these steps.
