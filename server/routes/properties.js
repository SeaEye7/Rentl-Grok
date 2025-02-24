const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Message = require('../models/Message');

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('tenants')
      .populate({
        path: 'payments',
        model: 'Payment',
      })
      .populate({
        path: 'expenses',
        model: 'Expense',
      })
      .populate({
        path: 'messages',
        model: 'Message',
      });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ error: 'Failed to fetch property', message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('tenants');
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
      overdueRent: property.overdueRent,
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
    res.json(newProperty);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: 'Failed to add property', message: err.message });
  }
});

module.exports = router;