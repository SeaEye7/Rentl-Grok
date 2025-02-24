const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  leaseStart: Date,
  leaseEnd: Date,
  imgPath: String, // Optional for tenant image
});

module.exports = mongoose.model('Tenant', tenantSchema);