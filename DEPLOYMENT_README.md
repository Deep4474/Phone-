# ONGOD Gadget Shop - Deployment Guide

## Deploy to Vercel

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Have a Vercel account (free at vercel.com)

### Steps to Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```
   

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the project**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `ongod-gadget-shop` (or your preferred name)
   - Directory: `.` (current directory)
   - Override settings: `N`

5. **Your app will be deployed** to a URL like: `https://ongod-gadget-shop.vercel.app`

### Environment Variables (Optional)

If you want to customize the email settings, add these in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Go to Settings > Environment Variables
3. Add:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password
   - `JWT_SECRET`: A secure random string

### Features After Deployment

✅ **User Registration & Login**
✅ **Email Verification**
✅ **Product Browsing**
✅ **Order Management**
✅ **Address Management**
✅ **Admin Panel** (admin@ongod.com / admin123)

### Admin Access

- **Email**: admin@ongod.com
- **Password**: admin123
- **Admin URL**: `https://your-app.vercel.app/admin.html`

### Notes

- Google Maps is temporarily disabled due to billing requirements
- The app uses a fallback address form for delivery
- All data is stored in memory (resets on server restart)
- For production, consider using a database

### Custom Domain (Optional)

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain 