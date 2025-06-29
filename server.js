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

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Security middleware
app.use(helmet());

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
      'http://127.0.0.1:5501'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// In-memory data storage
let users = [];
let adminUsers = [
  {
    id: 'admin',
    name: 'Admin',
    email: 'admin@ongod.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    createdAt: new Date().toISOString()
  }
];
let products = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    price: "₦1,200,000",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop",
    description: "Latest iPhone with advanced features",
    category: "Smartphones",
    stock: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    price: "₦950,000",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=200&fit=crop",
    description: "Premium Android smartphone",
    category: "Smartphones",
    stock: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "MacBook Pro M3",
    price: "₦2,500,000",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
    description: "Powerful laptop for professionals",
    category: "Laptops",
    stock: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "iPad Air",
    price: "₦850,000",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop",
    description: "Versatile tablet for work and play",
    category: "Tablets",
    stock: 20,
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "AirPods Pro",
    price: "₦350,000",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=200&fit=crop",
    description: "Wireless earbuds with noise cancellation",
    category: "Accessories",
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "Apple Watch Series 9",
    price: "₦450,000",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=200&fit=crop",
    description: "Smartwatch with health monitoring",
    category: "Wearables",
    stock: 18,
    createdAt: new Date().toISOString()
  }
];
let orders = [];

// Email configuration (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ayomideoluniyi49@gmail.com', // Replace with your Gmail address
    pass: 'sdrw yalf tsys jlmy' // Replace with your Gmail app password
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
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = {
      id: uuidv4(),
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
    };
    users.push(newUser);
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
app.post('/api/auth/verify', (req, res) => {
  try {
    console.log('Verification request body:', req.body);
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      console.log('Missing verification fields:', { email: !!email, verificationCode: !!verificationCode });
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }
    const user = users.find(u => u.email === email && u.verificationCode === verificationCode);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    user.isVerified = true;
    user.verificationCode = null;
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing login fields:', { email: !!email, password: !!password });
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = users.find(u => u.email === email);
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
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
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
app.get('/api/products', (req, res) => {
  try {
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
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
app.post('/api/products', authenticateAdmin, (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body;
    if (!name || !price || !description || !category || !stock) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const newProduct = {
      id: uuidv4(),
      name,
      price,
      image: image || 'https://via.placeholder.com/300x200?text=No+Image',
      description,
      category,
      stock: parseInt(stock),
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    res.json({ success: true, message: 'Product created successfully', productId: newProduct.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { name, price, description, category, stock, image } = req.body;
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    products[productIndex] = {
      ...products[productIndex],
      name,
      price,
      image: image || products[productIndex].image,
      description,
      category,
      stock: parseInt(stock)
    };
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateAdmin, (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    products.splice(productIndex, 1);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
});

// Place order (Authenticated users only)
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { productId, quantity, deliveryOption, deliveryAddress, paymentMethod } = req.body;
    if (!productId || !quantity || !deliveryOption || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
    const totalPrice = price * quantity;
    const newOrder = {
      id: uuidv4(),
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
    };
    orders.push(newOrder);
    product.stock -= quantity;
    res.json({ success: true, message: 'Order placed successfully', orderId: newOrder.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const userOrders = orders
      .filter(o => o.userId === req.user.id)
      .map(order => {
        const product = products.find(p => p.id === order.productId);
        return {
          ...order,
          productName: product ? product.name : 'Unknown Product',
          productImage: product ? product.image : '',
          productPrice: product ? product.price : ''
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: userOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Get all orders (Admin only)
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const adminOrders = orders.map(order => {
      const product = products.find(p => p.id === order.productId);
      const user = users.find(u => u.id === order.userId);
      return {
        ...order,
        productName: product ? product.name : 'Unknown Product',
        productImage: product ? product.image : '',
        userName: user ? user.name : 'Unknown User',
        userEmail: user ? user.email : '',
        userPhone: user ? user.phone : ''
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: adminOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    order.adminNotes = adminNotes || '';
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

// Static file serving - AFTER API routes
app.use(express.static('./'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin credentials: admin@ongod.com / admin123`);
}); 