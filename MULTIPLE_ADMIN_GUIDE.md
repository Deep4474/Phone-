# Multiple Admin Management Guide

## Current Admin Users

Based on server logs, you have **3 admin accounts**:

### 1. Original Admin
- **Email**: `ayomide123@gmail.com`
- **Password**: `admin123`
- **Name**: Admin
- **Status**: ✅ Active

### 2. Second Admin  
- **Email**: `deepword37@gmail.com`
- **Password**: (set during registration)
- **Name**: Ayomide
- **Status**: ✅ Active

### 3. Third Admin
- **Email**: `ayomideoluniyi49@gmail.com` 
- **Password**: (set during registration)
- **Name**: olamide
- **Status**: ✅ Active

## How to Work with Multiple Admins

### 🔐 **Login to Different Admin Accounts**

1. **Go to admin panel**: http://localhost:3002/admin.html (local) or https://phone-2cv4.onrender.com/admin.html (Render)

2. **Login with any admin credentials**:
   ```
   Email: ayomide123@gmail.com
   Password: admin123
   
   Email: deepword37@gmail.com
   Password: (your registered password)
   
   Email: ayomideoluniyi49@gmail.com
   Password: (your registered password)
   ```

### 📧 **Email Notifications**

**All 3 admins receive notifications for:**
- ✅ New order placements
- ✅ Order status updates
- ✅ Test emails

### 🛠️ **Admin Panel Features**

Each admin can:
- **View all orders** (same data for all admins)
- **Update order status** (changes visible to all admins)
- **Manage products** (add/edit/delete products)
- **View analytics** (same dashboard for all)
- **Test email system** (using "Test Email" button)

### 🔄 **Switch Between Admin Accounts**

1. **Logout** from current admin
2. **Login** with different admin credentials
3. **All data is shared** between admins

### 📱 **Admin Registration**

To add more admins:
1. **Go to admin panel**
2. **Click "Register New Admin"**
3. **Fill in details**:
   - Full Name
   - Email
   - Password
4. **New admin** will be added to the system

### 🗑️ **Remove Admin (if needed)**

Currently, admins are stored in memory. To remove an admin:
1. **Restart the server** (clears dynamic admins)
2. **Only original admin** (`ayomide123@gmail.com`) will remain
3. **Re-register** needed admins

### 📊 **Admin Activity**

**Current admin activity** (from logs):
- `ayomideoluniyi49@gmail.com` is currently active
- All admins have successful authentication
- Email notifications are working for all

## Best Practices

1. **Use different admin accounts** for different purposes
2. **All admins see the same data** - no separation
3. **Email notifications** go to all admins
4. **Keep passwords secure** for each admin account
5. **Logout properly** when switching accounts

## Troubleshooting

### If admin can't login:
1. **Check email/password** combination
2. **Verify admin exists** in system
3. **Try registering** the admin again

### If notifications not received:
1. **Check spam folder**
2. **Verify email address** is correct
3. **Test email system** using admin panel

## Next Steps

1. **Test all admin logins**
2. **Verify email notifications** for each admin
3. **Place test orders** to confirm notifications work
4. **Use admin panel** to manage orders and products 