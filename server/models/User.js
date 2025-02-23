const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountType: { type: String, enum: ['landlord', 'tenant'], required: true }, // 'landlord' or 'tenant'
});

module.exports = mongoose.model('User', userSchema);