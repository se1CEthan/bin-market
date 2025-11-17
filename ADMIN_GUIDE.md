# Admin Guide - Brain Inspired Network

## 🔐 How to Become Admin

### Step 1: Make Yourself Admin

Run this command with the email you used to sign in:

```bash
npm run make-admin your@email.com
```

Example:
```bash
npm run make-admin john@gmail.com
```

You should see:
```
✅ Successfully made john@gmail.com an admin!
You can now access the admin dashboard at:
https://braininspirednetwork.cloud/admin/dashboard
```

### Step 2: Access Admin Dashboard

1. Go to https://braininspirednetwork.cloud
2. Sign in with your Google account
3. Click on your profile picture (top right)
4. Click **"Admin Dashboard"** in the dropdown menu

Or go directly to: https://braininspirednetwork.cloud/admin/dashboard

## 📋 Admin Dashboard Features

### 1. Platform Statistics
- Total bots listed
- Total developers
- Total downloads
- Total revenue
- Platform earnings (5%)

### 2. Pending Bots Review

**What You'll See:**
- List of all bots waiting for approval
- Bot title, developer name, category
- Upload date
- Preview of bot details

**How to Approve a Bot:**
1. Click on a pending bot to review
2. Check the bot details:
   - Title and description
   - Price
   - Features
   - Files uploaded
   - Developer info
3. Click **"Approve"** button
4. Bot immediately appears in marketplace

**How to Reject a Bot:**
1. Click on a pending bot
2. Click **"Reject"** button
3. Bot stays hidden from marketplace
4. Developer can see rejection in their dashboard

### 3. Bot Management

**View All Bots:**
- See all bots (approved, pending, rejected)
- Filter by status
- Search by title or developer

**Edit Bot Status:**
- Change from approved to rejected
- Change from rejected to approved
- Remove bots if needed

### 4. User Management (Future Feature)
- View all users
- View all developers
- Ban/unban users
- View user activity

## 🎯 Bot Approval Checklist

Before approving a bot, check:

### ✅ Quality Checks
- [ ] Title is clear and descriptive
- [ ] Description explains what the bot does
- [ ] Price is reasonable
- [ ] Category is correct
- [ ] Bot file is uploaded
- [ ] Thumbnail image is present (if uploaded)
- [ ] Features are listed
- [ ] System requirements are clear

### ❌ Reasons to Reject
- Misleading title or description
- Inappropriate content
- Malware or suspicious files
- Stolen/copied bot
- Incomplete information
- Wrong category
- Unreasonable price
- Violates terms of service

## 🚀 Bot Approval Workflow

```
Developer uploads bot
        ↓
Status: "pending"
        ↓
Admin reviews in dashboard
        ↓
    ┌───────┴───────┐
    ↓               ↓
Approve         Reject
    ↓               ↓
Status:         Status:
"approved"      "rejected"
    ↓               ↓
Appears in      Hidden from
marketplace     marketplace
```

## 📊 Admin Dashboard Sections

### Overview Tab
- Platform statistics
- Recent activity
- Revenue charts
- Top performing bots

### Pending Bots Tab
- All bots waiting for approval
- Quick approve/reject buttons
- Bulk actions (future)

### All Bots Tab
- Complete bot list
- Filter by status
- Search functionality
- Edit/delete options

### Developers Tab (Future)
- All registered developers
- Developer statistics
- Payout requests
- Developer verification

### Settings Tab (Future)
- Platform settings
- Commission rates
- Featured bot management
- Email templates

## 💡 Best Practices

### Approval Speed
- Review bots within 24 hours
- Faster approval = happier developers
- Set up email notifications for new uploads

### Communication
- If rejecting, consider adding rejection reason
- Reach out to developers for clarification
- Be fair and consistent

### Quality Control
- Maintain high standards
- Test bots when possible
- Check for duplicates
- Verify developer claims

### Featured Bots
- Feature high-quality bots on homepage
- Rotate featured bots weekly
- Consider developer reputation

## 🔧 Admin Commands

### Make User Admin
```bash
npm run make-admin email@example.com
```

### Remove Admin Access
```bash
# Run this in database or create script
UPDATE users SET is_admin = false WHERE email = 'email@example.com';
```

### View All Admins
```bash
# In database
SELECT email, name FROM users WHERE is_admin = true;
```

## 📈 Monitoring

### Daily Tasks
- [ ] Review pending bots
- [ ] Check platform statistics
- [ ] Monitor user reports
- [ ] Review new developers

### Weekly Tasks
- [ ] Update featured bots
- [ ] Review top performing bots
- [ ] Check for policy violations
- [ ] Analyze platform metrics

### Monthly Tasks
- [ ] Review commission rates
- [ ] Update platform policies
- [ ] Developer outreach
- [ ] Platform improvements

## 🚨 Handling Issues

### Reported Bots
1. Review the report
2. Check bot details
3. Contact developer if needed
4. Take action (remove, suspend, etc.)

### Developer Disputes
1. Listen to both sides
2. Review evidence
3. Make fair decision
4. Document everything

### Refund Requests
1. Check purchase details
2. Verify issue
3. Contact developer
4. Process refund if valid

## 📞 Support

### For Developers
- Email: support@braininspirednetwork.cloud
- Response time: 24 hours
- Be helpful and professional

### For Buyers
- Email: support@braininspirednetwork.cloud
- Help with purchases
- Bot issues
- Refund requests

## 🎯 Success Metrics

Track these as admin:
- Bot approval time (target: < 24 hours)
- Bot quality (rejection rate < 20%)
- Developer satisfaction
- Buyer satisfaction
- Platform growth
- Revenue growth

## 🔒 Security

### Admin Account Security
- Use strong password
- Enable 2FA (when available)
- Don't share admin access
- Log out when done
- Monitor admin activity

### Platform Security
- Review suspicious bots
- Check for malware
- Monitor unusual activity
- Protect user data
- Regular security audits

---

**Remember**: As admin, you're the gatekeeper of quality. Your decisions directly impact the marketplace reputation and user trust. Be fair, be fast, and be thorough!
