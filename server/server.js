const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./models/Property');
require('./models/Tenant');
require('./models/User'); 
require('./models/Payment');
require('./models/Expense');
require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use the properties router
const propertiesRouter = require('./routes/properties');
app.use('/properties', propertiesRouter);

// Use the tenants router
const tenantsRouter = require('./routes/tenants');
app.use('/tenants', tenantsRouter);

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));