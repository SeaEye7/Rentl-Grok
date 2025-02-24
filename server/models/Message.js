const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  date: Date,
  sender: String, // e.g., tenant name
  message: String,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
});

module.exports = mongoose.model('Message', messageSchema);