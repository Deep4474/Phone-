const fs = require('fs');
const path = require('path');
const ORDERS_FILE = path.join(__dirname, '../orders.json');

function loadOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

let orders = loadOrders();

module.exports = { orders, saveOrders }; 