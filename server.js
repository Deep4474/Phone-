require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Import MongoDB models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ongod-gadget-shop';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('📊 Database:', MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas (Cloud)');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('⚠️  Falling back to in-memory storage...');
});

// Initialize default products if database is empty
async function initializeDefaultProducts() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Initializing default products...');
      const defaultProducts = [
        {
          name: "iPhone 15 Pro",
          price: "₦1,200,000",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop",
          description: "Latest iPhone with advanced features",
          category: "Smartphones",
          stock: 15
        },
        {
          name: "Samsung Galaxy S24",
          price: "₦950,000",
          image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=200&fit=crop",
          description: "Premium Android smartphone",
          category: "Smartphones",
          stock: 12
        },
        {
          name: "MacBook Pro M3",
          price: "₦2,500,000",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
          description: "Powerful laptop for professionals",
          category: "Laptops",
          stock: 8
        },
        {
          name: "iPad Air",
          price: "₦850,000",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop",
          description: "Versatile tablet for work and play",
          category: "Tablets",
          stock: 20
        },
        {
          name: "AirPods Pro",
          price: "₦350,000",
          image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=200&fit=crop",
          description: "Wireless earbuds with noise cancellation",
          category: "Accessories",
          stock: 30
        },
        {
          name: "Apple Watch Series 9",
          price: "₦450,000",
          image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=200&fit=crop",
          description: "Smartwatch with health monitoring",
          category: "Wearables",
          stock: 18
        }
      ];
      
      await Product.insertMany(defaultProducts);
      console.log('✅ Default products initialized successfully');
    }
  } catch (error) {
    console.error('❌ Error initializing default products:', error);
  }
}

// Call initialization function
initializeDefaultProducts();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
        "script-src-attr": ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com"
        ],
        connectSrc: ["'self'", "http://localhost:3002", "https://phone-2cv4.onrender.com", "https://maps.googleapis.com"],
        fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
        frameSrc: ["'self'", "https://www.google.com", "https://maps.googleapis.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3001', 
      'http://127.0.0.1:3001', 
      'http://localhost:5500', 
      'http://127.0.0.1:5500', 
      'http://localhost:5501', 
      'http://127.0.0.1:5501',
      'http://localhost:5502', 
      'http://127.0.0.1:5502',
      'http://localhost:3002', 
      'http://127.0.0.1:3002',
      'https://ol43435.github.io', // GitHub Pages frontend
      'https://phone-2cv4.onrender.com' // Added Render backend URL
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Load admin users from admins.json
const adminUsers = require('./admins.json');

// Email configuration (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Set in Render dashboard
    pass: process.env.EMAIL_PASS  // Set in Render dashboard
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Admin auth - Auth header:', authHeader);
  console.log('Admin auth - Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Admin auth - JWT error:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    
    console.log('Admin auth - User from token:', user);
    console.log('Admin auth - Available admin users:', adminUsers.map(a => a.email));
    
    // Check if user has admin flag and exists in adminUsers array
    if (!user.isAdmin) {
      console.log('Admin auth - User is not admin:', user.email);
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const adminUser = adminUsers.find(a => a.email === user.email);
    if (!adminUser) {
      console.log('Admin auth - User not found in adminUsers:', user.email);
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    console.log('Admin auth - Success for user:', user.email);
    req.user = user;
    next();
  });
};

// API Routes - Define these BEFORE static file serving

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, phone, state, area, street, address } = req.body;
    if (!name || !email || !password || !phone || !state || !area || !street || !address) {
      console.log('Missing fields:', { name: !!name, email: !!email, password: !!password, phone: !!phone, state: !!state, area: !!area, street: !!street, address: !!address });
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      state,
      area,
      street,
      address,
      isVerified: false,
      verificationCode,
      createdAt: new Date().toISOString()
    });
    await newUser.save();
    const mailOptions = {
      from: process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com',
      to: email,
      subject: 'ONGOD Gadget Shop - Email Verification',
      html: `
        <h2>Welcome to ONGOD Gadget Shop!</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>Please use this code to verify your email address.</p>
        <p>Best regards,<br>ONGOD Gadget Shop Team</p>
      `
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Email error:', error);
      } else {
        console.log('Verification email sent:', info.response);
      }
    });
    res.json({ success: true, message: 'Registration successful. Please check your email for verification code.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Email Verification
app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('Verification request body:', req.body);
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      console.log('Missing verification fields:', { email: !!email, verificationCode: !!verificationCode });
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }
    const user = await User.findOne({ email, verificationCode });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing login fields:', { email: !!email, password: !!password });
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Please verify your email first' });
    }
    bcrypt.compare(password, user.password, (err, validPassword) => {
      if (err || !validPassword) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          state: user.state,
          area: user.area,
          street: user.street,
          address: user.address
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

// Upload image endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, message: 'Image uploaded successfully', imagePath: imagePath });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading image', error: error.message });
  }
});

// Create new product (Admin only)
app.post('/api/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body;
    if (!name || !price || !description || !category || !stock) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const newProduct = new Product({
      name,
      price,
      image: image || 'https://via.placeholder.com/300x200?text=No+Image',
      description,
      category,
      stock: parseInt(stock),
      createdAt: new Date().toISOString()
    });
    await newProduct.save();
    res.json({ success: true, message: 'Product created successfully', productId: newProduct._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.name = name;
    product.price = price;
    product.image = image || product.image;
    product.description = description;
    product.category = category;
    product.stock = parseInt(stock);
    await product.save();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
});

// Place order (Authenticated users only)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, deliveryOption, deliveryAddress, paymentMethod } = req.body;
    if (!productId || !quantity || !deliveryOption || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
    const totalPrice = price * quantity;
    const newOrder = new Order({
      userId: req.user.id,
      productId,
      quantity,
      totalPrice: `₦${totalPrice.toLocaleString()}`,
      deliveryOption,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod,
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString()
    });
    await newOrder.save();
    product.stock -= quantity;
    await product.save();

    // Notify all admins of new order
    const adminEmails = adminUsers.map(a => a.email).filter(Boolean);
    console.log('Admin emails found:', adminEmails);
    console.log('Admin users:', adminUsers);
    
    if (adminEmails.length > 0) {
      console.log('Attempting to send admin notification to:', adminEmails);
      const mailOptions = {
        from: process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com',
        to: adminEmails.join(','),
        subject: `New Order Placed: #${newOrder._id}`,
        html: `
          <h2>New Order Placed</h2>
          <p>Order ID: ${newOrder._id}</p>
          <p>User: ${req.user ? req.user.name : 'Unknown'}</p>
          <p>Product: ${product ? product.name : ''}</p>
          <p>Quantity: ${newOrder.quantity}</p>
          <p>Total: ${newOrder.totalPrice}</p>
          <p>Delivery Option: ${newOrder.deliveryOption}</p>
          <p>Payment Method: ${newOrder.paymentMethod}</p>
          <p>Delivery Address: ${newOrder.deliveryAddress}</p>
          <p>Date: ${newOrder.createdAt}</p>
        `
      };
      
      console.log('Email configuration:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Admin new order email error:', error);
          console.log('Email error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
          });
        } else {
          console.log('Admin new order email sent successfully:', info.response);
          console.log('Message ID:', info.messageId);
        }
      });
    } else {
      console.log('No admin emails found! Admin users:', adminUsers);
    }

    res.json({ success: true, message: 'Order placed successfully', orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userOrders = await Order.find({ userId: req.user.id })
      .populate('productId')
      .sort({ createdAt: -1 });
    
    const formattedOrders = userOrders.map(order => ({
      ...order.toObject(),
      productName: order.productId ? order.productId.name : 'Unknown Product',
      productImage: order.productId ? order.productId.image : '',
      productPrice: order.productId ? order.productId.price : ''
    }));
    
    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Get all orders (Admin only)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const adminOrders = await Order.find()
      .populate('userId')
      .populate('productId')
      .sort({ createdAt: -1 });
    
    const formattedOrders = adminOrders.map(order => ({
      ...order.toObject(),
      productName: order.productId ? order.productId.name : 'Unknown Product',
      productImage: order.productId ? order.productId.image : '',
      userName: order.userId ? order.userId.name : 'Unknown User',
      userEmail: order.userId ? order.userId.email : '',
      userPhone: order.userId ? order.userId.phone : ''
    }));
    
    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    order.adminNotes = adminNotes || '';
    await order.save();

    // Find the user for this order
    const user = await User.findById(order.userId);
    // Find the product for this order
    const product = await Product.findById(order.productId);
    const productName = product ? product.name : '';
    if (user && user.email) {
      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com',
        to: user.email,
        subject: `Your Order #${order._id} Status Update`,
        html: `
          <h2>Order Update from ONGOD Gadget Shop</h2>
          <p>Hi ${user.name},</p>
          <p>Your order <strong>#${order._id}</strong> status has been updated to: <strong>${order.status.toUpperCase()}</strong>.</p>
          <p>Product: ${productName}</p>
          <p>Quantity: ${order.quantity}</p>
          <p>Total: ${order.totalPrice}</p>
          <p>Admin Notes: ${order.adminNotes || 'None'}</p>
          <p>Thank you for shopping with us!</p>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Order update email error:', error);
        } else {
          console.log('Order update email sent:', info.response);
        }
      });
    }

    // Notify all admins of order update
    const adminEmails = adminUsers.map(a => a.email).filter(Boolean);
    if (adminEmails.length > 0) {
      const mailOptionsAdmin = {
        from: process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com',
        to: adminEmails.join(','),
        subject: `Order #${order._id} Status Updated` ,
        html: `
          <h2>Order Status Updated</h2>
          <p>Order ID: ${order._id}</p>
          <p>User: ${user ? user.name : 'Unknown'}</p>
          <p>Product: ${productName}</p>
          <p>New Status: ${order.status.toUpperCase()}</p>
          <p>Admin Notes: ${order.adminNotes || 'None'}</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        `
      };
      transporter.sendMail(mailOptionsAdmin, (error, info) => {
        if (error) {
          console.log('Admin order update email error:', error);
        } else {
          console.log('Admin order update email sent:', info.response);
        }
      });
    }

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = adminUsers.find(a => a.email === email);
    
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    bcrypt.compare(password, admin.password, (err, validPassword) => {
      if (err || !validPassword) {
        return res.status(400).json({ success: false, message: 'Invalid admin credentials' });
      }
      
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          name: admin.name,
          isAdmin: true // Add admin flag
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Admin login successful',
        token: token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin registration
app.post('/api/admin/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if admin already exists
    const existingAdmin = adminUsers.find(a => a.email === email);
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin
    const newAdmin = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    adminUsers.push(newAdmin);
    
    // Generate admin token
    const token = jwt.sign(
      { 
        id: newAdmin.id, 
        email: newAdmin.email, 
        name: newAdmin.name,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true, 
      message: 'Admin registered successfully. You can now login with your credentials.',
      token: token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Test email configuration endpoint
app.post('/api/test-email', authenticateAdmin, (req, res) => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    console.log('Admin users:', adminUsers);
    
    const adminEmails = adminUsers.map(a => a.email).filter(Boolean);
    
    if (adminEmails.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No admin emails found',
        adminUsers: adminUsers 
      });
    }
    
    const testMailOptions = {
      from: process.env.EMAIL_USER || 'ayomideoluniyi49@gmail.com',
      to: adminEmails[0], // Send to first admin
      subject: 'Test Email - ONGOD Gadget Shop',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email configuration.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>If you receive this, the email system is working correctly.</p>
      `
    };
    
    transporter.sendMail(testMailOptions, (error, info) => {
      if (error) {
        console.log('Test email error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Email test failed', 
          error: error.message,
          details: {
            code: error.code,
            command: error.command,
            response: error.response
          }
        });
      } else {
        console.log('Test email sent successfully:', info.response);
        res.json({ 
          success: true, 
          message: 'Test email sent successfully',
          messageId: info.messageId,
          response: info.response
        });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Static file serving - AFTER API routes
app.use(express.static('./'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin credentials: admin@ongod.com / admin123`);
}); 