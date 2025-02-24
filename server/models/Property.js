const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  address: String,
  imageUrl: String,
  status: String,
  leaseStart: Date,
  leaseEnd: Date,
  rentAmount: Number,
  securityDeposit: Number,
  overdueRent: String,
  tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
  payments: [{
    sender: String,
    amount: Number,
    type: String,
    _id: false,
  }],
  expenses: [{
    description: String,
    cost: Number,
    date: Date,
    _id: false,
  }],
  messages: [{
    sender: String,
    message: String,
    date: Date,
    _id: false,
  }],
});

module.exports = mongoose.model('Property', propertySchema);