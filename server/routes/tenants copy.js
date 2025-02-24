const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, property, leaseStart, leaseEnd } = req.body;
    const tenant = new Tenant({ name, email, phone, property, leaseStart, leaseEnd });
    await tenant.save();
    await Property.findByIdAndUpdate(property, { $push: { tenants: tenant._id } });
    res.json(tenant);
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
    await Property.findByIdAndUpdate(tenant.property, { $pull: { tenants: tenantId } });
    res.json({ message: 'Tenant removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant', message: err.message });
  }
});

module.exports = router;