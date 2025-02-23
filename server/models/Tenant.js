const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  paymentMethods: [String], // e.g., card numbers or tokens (for future payment features)
  leaseStart: Date, // New field for lease start
  leaseEnd: Date,   // New field for lease end
});

module.exports = mongoose.model('Tenant', tenantSchema);