const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user (landlord or tenant)
router.post('/register', async (req, res) => {
  try {
    const { email, password, accountType } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, accountType });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: { email, accountType } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user', message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);
      const user = await User.findOne({ email });
      console.log('User found:', user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ email: user.email, accountType: user.accountType }, 'your-secret-key', { expiresIn: '1h' });
      res.json({ token, user: { email: user.email, accountType: user.accountType } });
    } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Failed to login', message: err.message });
    }
  });

module.exports = router;