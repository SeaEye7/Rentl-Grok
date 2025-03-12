const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

// Import authenticateToken from middleware
const authenticateToken = require('../middleware/authenticateToken');

// GET /tenants (public, all tenants with populated property data)
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

// GET /tenants/filter (authenticated, filter by property ID or user ID)
router.get('/filter', authenticateToken, async (req, res) => {
  try {
    const propertyId = req.query.propertyId; // Optional: Filter by property
    const userId = req.query.userId; // Optional: Filter by tenant ID
    let query = {};
    if (propertyId) query.property = propertyId;
    if (userId) query.userId = userId; // Adjust based on your tenant schema (ensure 'userId' exists in Tenant model)
    const tenants = await Tenant.find(query).populate({
      path: 'property',
      select: '_id address status'
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants', message: error.message });
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

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, property, leaseStart, leaseEnd } = req.body;
    // Ensure tenant is associated with the authenticated user (if needed)
    const tenant = new Tenant({ name, email, phone, property, leaseStart, leaseEnd, userId: req.user.id }); // Add userId if your schema supports it
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

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    // Ensure the authenticated user can only delete their own tenants
    if (tenant.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own tenants' });
    }
    await Tenant.findByIdAndDelete(tenantId);
    res.json({ message: 'Tenant removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant', message: err.message });
  }
});

module.exports = router;