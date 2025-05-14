// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false, // set to true for SQL query logs
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

// Import models
const User = require('./User')(sequelize, DataTypes);
const Image = require('./Image')(sequelize, DataTypes);

// Define associations
User.hasMany(Image, { foreignKey: 'userId' });
Image.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Image,
};
