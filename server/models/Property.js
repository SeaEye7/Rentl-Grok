const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  address: String,
  imageUrl: String,
  status: String, // e.g., "Currently Renting", "Upcoming Lease"
  tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
  leaseStart: Date,
  leaseEnd: Date,
  rentAmount: Number,
  securityDeposit: Number,
});

module.exports = mongoose.model('Property', propertySchema);