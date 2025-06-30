const fs = require('fs');
const path = require('path');
const USERS_FILE = path.join(__dirname, '../users.json');

function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

let users = loadUsers();

module.exports = { users, saveUsers }; 