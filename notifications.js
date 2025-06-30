const fs = require('fs');
const path = require('path');
const NOTIFICATIONS_FILE = path.join(__dirname, '../notifications.json');

function loadNotifications() {
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error("Error loading notifications:", e);
    return [];
  }
}

function saveNotifications(notifications) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  } catch (e) {
    console.error("Error saving notifications:", e);
  }
}

let notifications = loadNotifications();

module.exports = { notifications, saveNotifications }; 