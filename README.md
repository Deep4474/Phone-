# ONGOD Gadget Shop

A modern e-commerce web application for selling gadgets and electronics, built with HTML, CSS, and JavaScript.

## Features

- **User Authentication**: Login and registration system
- **Product Catalog**: Display of various gadgets with images and prices
- **Shopping Experience**: Product selection and purchase flow
- **Delivery Options**: Pick-up and delivery choices
- **Payment Methods**: Card and bank transfer options
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Getting Started

1. Open `index.html` in your web browser
2. The application will start with the login page

### Test Account

You can use the following test account to login:
- **Email**: test@example.com
- **Password**: password123

### Registration

1. Click "Register here" on the login page
2. Fill in all required fields:
   - Full Name
   - Email
   - Password
   - Phone
   - State
   - Area
   - Street
   - Full Address
3. Click "Register" to create your account

### Shopping

1. After logging in, you'll see the product catalog
2. Browse through the available gadgets
3. Click "Buy Now" on any product you want to purchase
4. Choose your delivery option (Pick Up or Delivery)
5. Select your payment method (Card or Bank Transfer)
6. Click "Pay Now" to complete your order

## File Structure

```
├── index.html      # Main HTML file
├── style.css       # CSS styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Features in Detail

### User Management
- User registration with complete address information
- Secure login system
- Session persistence using localStorage
- Logout functionality

### Product Display
- Grid layout for products
- Product images, names, prices, and descriptions
- Hover effects for better user experience
- Responsive design for mobile devices

### Order Processing
- Product selection
- Delivery option selection (Pick Up/Delivery)
- Payment method selection
- Order confirmation with details

### Map Integration
- Google Maps integration for pickup/delivery locations
- Note: You'll need to add your own Google Maps API key

## Customization

### Adding Products
To add more products, edit the `products` array in `script.js`:

```javascript
const products = [
  {
    id: 7,
    name: 'Your Product Name',
    price: '₦Price',
    image: 'image-url',
    description: 'Product description'
  }
  // Add more products here
];
```

### Styling
Modify `style.css` to change the appearance:
- Colors and themes
- Layout and spacing
- Typography
- Responsive breakpoints

### Google Maps
To enable the map functionality:
1. Get a Google Maps API key
2. Replace `YOUR_API_KEY` in the `showMap()` function in `script.js`

## Browser Compatibility

This application works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Local Storage

The application uses browser localStorage to:
- Remember logged-in users
- Persist user sessions
- Store user data temporarily

## Security Notes

This is a frontend-only application for demonstration purposes. In a production environment, you would need:
- Backend server for data storage
- Proper authentication and authorization
- Secure payment processing
- Data encryption
- Input validation and sanitization

## License

This project is open source and available under the MIT License. 