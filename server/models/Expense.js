const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: String,
  cost: Number,
  date: Date,
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
});

module.exports = mongoose.model('Expense', expenseSchema);