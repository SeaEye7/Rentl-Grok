const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable for Secret Key

// Middleware to parse JSON body
router.use(express.json());

// Fetch payments for a property (from Property model, not Stripe)
router.get('/property/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId).select('payments');
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property.payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', message: err.message });
  }
});

// Process a payment using Stripe and update property
router.post('/', async (req, res) => {
  try {
    const { propertyId, sender, amount, type, paymentMethodId } = req.body; // paymentMethodId from Stripe frontend
    console.log('Received payment request:', { propertyId, sender, amount, type, paymentMethodId }); // Log request data for debugging

    // Validate propertyId as a valid ObjectId
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid property ID format', message: 'Property ID must be a valid 24-character hexadecimal string' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Validate paymentMethodId
    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return res.status(400).json({ error: 'Invalid payment method ID', message: 'A valid paymentMethodId is required' });
    }

    // Charge the tenant using Stripe, disabling redirect-based payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents (e.g., $100.00 -> 10000)
      currency: 'usd', // Adjust currency as needed (e.g., 'gbp', 'eur')
      payment_method: paymentMethodId,
      confirm: true, // Confirm payment immediately
      description: `Rent payment for ${property.address} by ${sender}`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Disable redirect-based payment methods
      },
    });

    // Add payment to property's payments array
    property.payments.push({
      sender,
      amount,
      type,
      date: new Date(),
      stripePaymentIntentId: paymentIntent.id, // Track Stripe payment ID
    });
    await property.save();

    // Notify frontend or trigger webhook for real-time tracking (optional)
    res.status(201).json({
      payment: property.payments[property.payments.length - 1],
      stripePaymentIntent: paymentIntent,
    });
  } catch (err) {
    console.error('Stripe/Payment Error:', err); // Log the error for debugging
    res.status(500).json({ error: 'Failed to process payment', message: err.message });
  }
});

// Update a payment (e.g., for corrections, not re-charging)
router.put('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { propertyId, sender, amount, type } = req.body;
    // Validate propertyId as a valid ObjectId
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid property ID format', message: 'Property ID must be a valid 24-character hexadecimal string' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const paymentIndex = property.payments.findIndex(p => p._id.toString() === paymentId);
    if (paymentIndex === -1) return res.status(404).json({ error: 'Payment not found' });

    property.payments[paymentIndex] = { ...property.payments[paymentIndex], sender, amount, type };
    await property.save();
    res.json(property.payments[paymentIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment', message: err.message });
  }
});

// Remove a payment (no refund via Stripe, just update property data)
router.delete('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { propertyId } = req.body;
    // Validate propertyId as a valid ObjectId
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid property ID format', message: 'Property ID must be a valid 24-character hexadecimal string' });
    }

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const paymentIndex = property.payments.findIndex(p => p._id.toString() === paymentId);
    if (paymentIndex === -1) return res.status(404).json({ error: 'Payment not found' });

    property.payments.splice(paymentIndex, 1);
    await property.save();
    res.json({ message: 'Payment removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove payment', message: err.message });
  }
});

module.exports = router;