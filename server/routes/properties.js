const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('tenants');
    // Normalize _id and tenants to strings
    const normalizedProperties = properties.map(property => ({
      _id: property._id.toString(),
      address: property.address,
      imageUrl: property.imageUrl,
      status: property.status,
      tenants: property.tenants.map(tenant => tenant._id.toString()),
      leaseStart: property.leaseStart,
      leaseEnd: property.leaseEnd,
      rentAmount: property.rentAmount,
      securityDeposit: property.securityDeposit,
    }));
    res.json(normalizedProperties);
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