const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find().populate({
      path: 'property',
      select: '_id address status' // Limit fields to reduce payload
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants', message: err.message });
  }
});

router.get('/property/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const tenants = await Tenant.find({ property: propertyId }).populate({
      path: 'property',
      select: '_id address status'
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tenants', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, property, leaseStart, leaseEnd } = req.body;
    const tenant = new Tenant({ name, email, phone, property, leaseStart, leaseEnd });
    await tenant.save();
    await tenant.populate({
      path: 'property',
      select: '_id address status'
    }); // Ensure property is populated for response
    res.status(201).json(tenant); // Use 201 for created resources
  } catch (err) {
    res.status(500).json({ error: 'Failed to add tenant', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    await Tenant.findByIdAndDelete(tenantId);
    res.json({ message: 'Tenant removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant', message: err.message });
  }
});

module.exports = router;