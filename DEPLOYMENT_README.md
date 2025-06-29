# ONGOD Gadget Shop - Render Deployment Guide

This project is configured to deploy on **Render** platform for optimal performance and reliability.

## 🚀 Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 📋 Prerequisites

- GitHub account
- Render account (free at [render.com](https://render.com))

---

## 🌐 Deploy to Render

### Method 1: One-Click Deploy (Easiest)
1. Click the "Deploy to Render" button above
2. Connect your GitHub account
3. Select your repository
4. Configure environment variables (optional)
5. Click "Create Web Service"

### Method 2: Manual Deploy

1. **Go to Render Dashboard**:
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `ongod-gadget-shop`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables** (Optional):
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_jwt_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete

6. **Your app will be deployed** to: `https://ongod-gadget-shop.onrender.com`

---

## 🔧 Environment Variables

Add these in your Render dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `my-super-secret-key-123` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `your-app-password` |
| `PORT` | Server port (auto-set by Render) | `10000` |

### How to Get Gmail App Password:
1. Enable 2-factor authentication on your Gmail
2. Go to Google Account settings
3. Security → App passwords
4. Generate a new app password

---

## 🌍 Render Features

### ✅ Automatic Platform Detection
- The app automatically detects Render deployment
- API calls are automatically routed to the correct backend
- No manual configuration needed

### ✅ Admin Panel Access
Render supports admin access:
- **Email**: `admin@ongod.com`
- **Password**: `admin123`
- **Admin URL**: `https://your-app.onrender.com/admin.html`

---

## 📊 Render Benefits

| Feature | Render |
|---------|--------|
| **Deployment Speed** | 🚀 Fast |
| **Free Tier** | ✅ Generous |
| **Custom Domains** | ✅ Free |
| **SSL Certificate** | ✅ Automatic |
| **Cold Start** | 🕐 Moderate |
| **Build Time** | 🚀 Fast |
| **Database Support** | ✅ Built-in |
| **File Storage** | ✅ Built-in |

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check if all dependencies are in `package.json`
   - Ensure `server.js` is the main file

2. **API Calls Fail**:
   - Check environment variables
   - Verify CORS settings in `server.js`

3. **Email Not Working**:
   - Verify Gmail app password
   - Check email environment variables

4. **Admin Panel Not Loading**:
   - Clear browser cache
   - Check if admin.html is accessible

5. **Cold Start Delays**:
   - Free tier has cold starts
   - Consider upgrading to paid plan for better performance

---

## 📞 Support

- **Render Support**: [render.com/docs](https://render.com/docs)
- **Project Issues**: Create an issue on GitHub

---

## 🎉 Success!

After deployment, your ONGOD Gadget Shop will be live with:

✅ **User Registration & Login**
✅ **Email Verification**
✅ **Product Browsing**
✅ **Order Management**
✅ **Address Management**
✅ **Admin Panel**
✅ **Google Maps Integration**
✅ **Responsive Design**

**Happy Deploying! 🚀** 