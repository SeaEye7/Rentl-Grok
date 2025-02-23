const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.get('/', async (req, res) => {
    console.log('GET /properties request received');
    try {
      const properties = await Property.find().populate('tenants');
      console.log('Properties fetched:', properties);
      res.json(properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      res.status(500).json({ error: 'Failed to fetch properties', message: err.message });
    }
  });

router.post('/', async (req, res) => {
  const newProperty = new Property(req.body);
  try {
    await newProperty.save();
    res.status(202).json(newProperty);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: 'Failed to add property', message: err.message });
  }
});

module.exports = router;