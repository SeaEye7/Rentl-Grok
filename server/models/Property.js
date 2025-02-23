const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  address: String,
  imageUrl: String,
  status: String, // e.g., "Currently Renting", "Upcoming Lease", "Vacant"
  tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
  leaseStart: Date, // Optional, can be added later via another form
  leaseEnd: Date,   // Optional, can be added later via another form
  rentAmount: Number, // Optional, can be added later
  securityDeposit: Number, // Optional, can be added later
});

module.exports = mongoose.model('Property', propertySchema);