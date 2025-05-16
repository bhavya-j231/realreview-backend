require('dotenv').config(); // loads your .env file variables
const jwt = require('jsonwebtoken');

const adminUserId = 2; // Replace with your admin user ID
const token = jwt.sign({ id: adminUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Admin JWT Token:', token);
