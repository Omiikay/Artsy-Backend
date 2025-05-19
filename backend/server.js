require('dotenv').config();
console.log('ARTSY_API_BASE:', process.env.ARTSY_API_BASE);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const artsyRoutes = require('./routes/artsy');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
// const { all } = require('axios');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:4200',
  credentials: true
}));

// API Routes
app.use('/api/artsy', artsyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, "./public/browser")));

  // Any route that doesn't match the above should redirect to index.html
  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "./public/browser/index.html"));
  // });
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public/browser/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
