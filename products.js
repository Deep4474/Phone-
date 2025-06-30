const fs = require('fs');
const path = require('path');
const PRODUCTS_FILE = path.join(__dirname, '../products.json');

function loadProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

let products = loadProducts();

module.exports = { products, saveProducts }; 