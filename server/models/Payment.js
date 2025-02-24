const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  sender: String, // e.g., tenant name
  amount: Number,
  type: String, // e.g., "RENT", "FEE"
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  date: Date,
});

module.exports = mongoose.model('Payment', paymentSchema);