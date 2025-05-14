require('dotenv').config();  // Ensure this is at the very top

const express = require('express');
const { sequelize } = require('./models');  // Import sequelize instance from models
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve images statically

// Routes
const imageRoutes = require('./routes/imageRoutes');
app.use('/', imageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Test PostgreSQL connection
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully.');
    
    // Sync models with database
    await sequelize.sync();
    console.log('✅ Database synchronized');

    // Optional: Test running a query
    const [results] = await sequelize.query('SELECT NOW()');
    console.log('Current timestamp:', results[0].now);
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }
});
