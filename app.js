require('dotenv').config();  // Ensure this is at the very top

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');  // Import sequelize instance from models
const auth = require('./middleware/auth');
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve images statically

// Routes
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/', imageRoutes);
app.use('/admin', [auth], adminRoutes); // Add auth middleware to admin routes

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
