const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { orders, saveOrders } = require('../data/orders');
const { products } = require('../data/products');
const { users } = require('../data/users');
const { notifications, saveNotifications } = require('../data/notifications');

const ADMIN_USERS_FILE = path.join(__dirname, '../admin-users.json');

// Helper to load admins from file
function loadAdmins() {
  try {
    const data = fs.readFileSync(ADMIN_USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
// Helper to save admins to file
function saveAdmins(admins) {
  fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(admins, null, 2));
}

// Persistent admin users
let adminUsers = loadAdmins();

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    
    // Check if user is actually an admin
    const adminUser = adminUsers.find(admin => admin.id === user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = adminUser;
    next();
  });
}

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin user
    const adminUser = adminUsers.find(admin => admin.email === email);
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate admin JWT token
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role,
        isAdmin: true 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...adminResponse } = adminUser;

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: adminResponse
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Admin register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (adminUsers.find(admin => admin.email === email)) {
      return res.status(409).json({ error: 'Admin with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      role: 'admin',
      name
    };
    adminUsers.push(newAdmin);
    saveAdmins(adminUsers);
    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Admin registration failed' });
  }
});

// Get admin profile
router.get('/profile', authenticateAdmin, (req, res) => {
  try {
    const { password: _, ...adminResponse } = req.admin;
    res.json({ admin: adminResponse });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to get admin profile' });
  }
});

// Get all orders (admin)
router.get('/orders', authenticateAdmin, (req, res) => {
  try {
    res.json({ orders });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order status (admin)
router.put('/orders/:id/update', authenticateAdmin, (req, res) => {
  try {
    const { status, message } = req.body;
    const order = orders.find(o => o._id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (status) order.status = status;
    if (message) order.adminMessage = message;
    saveOrders(orders);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get all users (admin)
router.get('/users', authenticateAdmin, (req, res) => {
  try {
    // Import users from auth route (you might want to move this to a shared module)
    const usersWithoutPassword = users.map(user => {
      const { password, ...userResponse } = user;
      return userResponse;
    });
    
    res.json({ users: usersWithoutPassword });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Send notification to user (admin)
router.post('/notifications/send', authenticateAdmin, (req, res) => {
  try {
    const { userId, message, type } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message required' });
    }
    
    const notif = {
      _id: Date.now().toString(),
      userId,
      message,
      type: type || 'admin',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(notif);
    saveNotifications(notifications);
    res.status(201).json({ success: true, notification: notif });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send email to user (admin) - mock
router.post('/email/send', authenticateAdmin, (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    
    if (!userId || !subject || !message) {
      return res.status(400).json({ error: 'userId, subject, and message required' });
    }
    
    // In production, send email using nodemailer
    res.json({ success: true, info: `Email sent to user ${userId} (mock)` });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Get admin dashboard stats
router.get('/dashboard', authenticateAdmin, (req, res) => {
  try {
    const stats = {
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      totalRevenue: orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0),
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get analytics data
router.get('/analytics', authenticateAdmin, (req, res) => {
  try {
    // 1. Sales over time (last 30 days)
    const salesByDay = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo && o.status === 'delivered')
      .forEach(o => {
        const date = new Date(o.createdAt).toISOString().split('T')[0];
        salesByDay[date] = (salesByDay[date] || 0) + o.totalAmount;
      });
    
    const salesData = Object.entries(salesByDay)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    // 2. Top selling products
    const productSales = {};
    orders.filter(o => o.status === 'delivered').forEach(o => {
      if (o.productId) {
          productSales[o.productId] = (productSales[o.productId] || 0) + o.quantity;
      }
    });

    const topProducts = Object.entries(productSales)
      .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
      .slice(0, 5)
      .map(([productId, quantitySold]) => {
        const product = products.find(p => p._id === productId);
        return {
          name: product ? product.name : `Product ID: ${productId}`,
          quantitySold
        };
      });
    
    // 3. Order status distribution
    const orderStatusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // 4. User registration trends (last 30 days)
    const usersByDay = {};
      users
      .filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo)
      .forEach(u => {
        const date = new Date(u.createdAt).toISOString().split('T')[0];
        usersByDay[date] = (usersByDay[date] || 0) + 1;
      });
    
    const userSignupsData = Object.entries(usersByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    res.json({
      salesData,
      topProducts,
      orderStatusCounts,
      userSignupsData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Admin logout
router.post('/logout', authenticateAdmin, (req, res) => {
  try {
    res.json({ message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Admin logout failed' });
  }
});

module.exports = router; 