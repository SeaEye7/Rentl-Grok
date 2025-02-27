const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Updated for Mongoose 6+)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enable CORS for localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Routes
app.use('/auth', require('./routes/auth')); // Ensure this line exists
app.use('/properties', require('./routes/properties'));
app.use('/tenants', require('./routes/tenants'));
app.use('/payments', require('./routes/payments'));
//app.use('/maintenance', require('./routes/maintenance')); // Placeholder
//app.use('/messages', require('./routes/messages')); // Placeholder

// Serve static files (if needed for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));