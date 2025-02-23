const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // Reference to the property they’re assigned to
  paymentMethods: [String], // e.g., card numbers or tokens (for future payment features)
});

module.exports = mongoose.model('Tenant', tenantSchema);