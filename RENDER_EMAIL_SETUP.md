# Render Email Setup Guide

## Current Status
✅ **Admin notifications are working locally** - Emails are being sent successfully
❌ **Render deployment needs email configuration**

## Problem
Your Render deployment doesn't have the email environment variables set, so admin notifications aren't working on the live site.

## Solution: Configure Email on Render

### Step 1: Set Up Gmail App Password
1. Go to https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new app password for "Mail"
4. Copy the 16-character password

### Step 2: Configure Render Environment Variables
1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your service (phone-2cv4)
3. Go to **Environment** tab
4. Add these environment variables:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
JWT_SECRET=your-secret-key-here
```

### Step 3: Redeploy Your Service
1. After adding environment variables, Render will automatically redeploy
2. Wait for deployment to complete
3. Test the system

### Step 4: Test Admin Notifications
1. **Place an order** from the customer side on Render
2. **Check admin emails** for notifications
3. **Use admin panel** to manage orders

## Current Email Configuration
From the logs, the system is using:
- **From**: `ayomideoluniyi49@gmail.com` (fallback)
- **To**: `ayomide123@gmail.com, deepword37@gmail.com`
- **Status**: ✅ Working locally

## Troubleshooting

### If emails still don't work after Render setup:
1. **Check Render logs** for email errors
2. **Verify environment variables** are loaded correctly
3. **Test with different Gmail account** if needed
4. **Check Gmail security settings**

### Common Render Issues:
- Environment variables not saved properly
- Service needs manual redeploy after variable changes
- Gmail app password not working on Render's servers

## Test Commands
You can test the email configuration by:
1. **Login to admin panel** on Render
2. **Click "Test Email" button**
3. **Check for success/error messages**

## Next Steps
1. Set up email environment variables on Render
2. Redeploy the service
3. Test order placement and admin notifications
4. Verify emails are received in both admin accounts 