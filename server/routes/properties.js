const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');

router.use(express.json());

// GET /properties (public, all properties with populated tenants)
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

// GET /properties/landlord (authenticated, filter by landlord ID)
router.get('/landlord', authenticateToken, async (req, res) => {
  try {
    const landlordId = req.user.id; // Get landlord ID from JWT
    const properties = await Property.find({ landlordId });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch landlord properties', message: error.message });
  }
});

// GET /properties/tenant (authenticated, filter by tenant ID)
router.get('/tenant', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id; // Get tenant ID from JWT
    const properties = await Property.find({ 'tenants': tenantId });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant properties', message: error.message });
  }
});

// GET /properties/:id (authenticated, specific property with all data)
router.get('/:id', authenticateToken, async (req, res) => {
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
    // Ensure the authenticated user (landlord or tenant) has access
    const landlordId = req.user.id;
    const isLandlord = req.user.role === 'landlord';
    const isTenant = req.user.role === 'tenant';

    if (isLandlord && property.landlordId.toString() !== landlordId) {
      return res.status(403).json({ error: 'Unauthorized: Property not owned by this landlord' });
    }
    if (isTenant && !property.tenants.some(tenant => tenant._id.toString() === tenantId)) {
      return res.status(403).json({ error: 'Unauthorized: Tenant not assigned to this property' });
    }
    res.json(property);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ error: 'Failed to fetch property', message: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const landlordId = req.user.id; // Get landlord ID from JWT
    const newProperty = new Property({ ...req.body, landlordId }); // Associate property with landlord
    await newProperty.save();
    res.json(newProperty);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: 'Failed to add property', message: err.message });
  }
});

module.exports = router;