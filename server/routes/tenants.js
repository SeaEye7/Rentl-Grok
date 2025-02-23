const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

router.post('/', async (req, res) => {
  const newTenant = new Tenant(req.body);
  try {
    await newTenant.save();
    res.json(newTenant);
  } catch (err) {
    console.error('Error adding tenant:', err);
    res.status(500).json({ error: 'Failed to add tenant', message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find().populate('property');
    res.json(tenants);
  } catch (err) {
    console.error('Error fetching tenants:', err);
    res.status(500).json({ error: 'Failed to fetch tenants', message: err.message });
  }
});

router.get('/property/:propertyId', async (req, res) => {
  try {
    const tenants = await Tenant.find({ property: req.params.propertyId }).populate('property');
    res.json(tenants);
  } catch (err) {
    console.error('Error fetching tenants for property:', err);
    res.status(500).json({ error: 'Failed to fetch tenants for property', message: err.message });
  }
});

module.exports = router;