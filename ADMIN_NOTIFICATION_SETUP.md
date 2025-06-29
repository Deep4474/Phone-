# Admin Notification Setup Guide

## Problem Identified
The admin notification system is not working because the email environment variables are not configured.

## Current Status
- ✅ Admin users: 1 found (`ayomide123@gmail.com`)
- ❌ Email configuration: Missing environment variables
- ❌ Admin notifications: Not working

## Solution: Set Up Email Environment Variables

### Step 1: Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification" (enable if not already)
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Set Environment Variables

#### Option A: For Local Development
Create a `.env` file in your project root:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
JWT_SECRET=your-secret-key
```

#### Option B: For Render Deployment
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add these environment variables:
   - `EMAIL_USER`: your-gmail@gmail.com
   - `EMAIL_PASS`: your-16-character-app-password
   - `JWT_SECRET`: your-secret-key

### Step 3: Test the Configuration

1. **Start your server** (if not already running)
2. **Login to admin panel** with admin credentials
3. **Use the test endpoint** to verify email configuration:
   ```bash
   POST /api/test-email
   Authorization: Bearer your-admin-token
   ```

### Step 4: Test Order Placement

1. **Register a test user** (if needed)
2. **Place an order** from the customer side
3. **Check admin email** (`ayomide123@gmail.com`) for notification

## Troubleshooting

### If emails are still not received:

1. **Check server logs** for email errors
2. **Verify Gmail settings**:
   - Less secure app access (if using regular password)
   - App password is correct
   - 2FA is enabled
3. **Check spam/junk folder**
4. **Verify environment variables** are loaded correctly

### Common Error Messages:

- `Invalid login`: Wrong email or password
- `Username and Password not accepted`: Use app password, not regular password
- `Authentication failed`: Check 2FA and app password setup

## Admin Notification Features

Once configured, admins will receive emails for:

1. **New Order Notifications**
   - Order ID
   - Customer details
   - Product information
   - Delivery details
   - Payment method

2. **Order Status Updates**
   - Status changes
   - Admin notes
   - Customer notifications

## Current Admin Configuration

```json
{
  "id": "admin",
  "name": "Admin", 
  "email": "ayomide123@gmail.com",
  "password": "hashed-password"
}
```

## Next Steps

1. Set up email environment variables
2. Test email configuration
3. Place a test order
4. Verify admin receives notification
5. Check admin dashboard for order management

## Support

If you continue having issues:
1. Check server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a different Gmail account if needed 