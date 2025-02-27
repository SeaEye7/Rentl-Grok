const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['Rent', 'Security Deposit', 'Late Fee'] }, // Restrict payment types
  date: { type: Date, default: Date.now },
  stripePaymentIntentId: { type: String, required: true }, // Store Stripe PaymentIntent ID
});

const propertySchema = new mongoose.Schema({
  address: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Occupied', 'Vacant', 'Under Maintenance', 'Currently Renting'], // Add "Currently Renting" to the enum
    default: 'Vacant' 
  },
  leaseStart: Date,
  leaseEnd: Date,
  rentAmount: Number,
  imageUrl: String,
  securityDeposit: Number,
  overdueRent: { type: Number, default: 0 },
  expenses: [
    {
      description: String,
      cost: Number,
      date: Date,
    },
  ],
  tenants: [
    {
      name: String,
      email: String,
      phone: String,
      imgPath: String,
      leaseStart: Date,
      leaseEnd: Date,
    },
  ],
  payments: {
    type: [paymentSchema], // Define payments as an array of payment objects
    default: [], // Default to an empty array for new documents
    set: function (value) {
      // Handle existing data: if payments is a string, null, or undefined, convert to empty array
      if (!value || typeof value === 'string' || value === null) {
        return [];
      }
      return value; // Keep existing arrays of objects as-is
    },
  },
  maintenance: [
    {
      description: String,
      date: Date,
      status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    },
  ],
  messages: [
    {
      sender: String,
      message: String,
      date: Date,
    },
  ],
});

// Optional: Add a pre-save hook to migrate existing status if needed
propertySchema.pre('save', function (next) {
  if (this.isModified('payments') && !Array.isArray(this.payments)) {
    this.payments = [];
  }
  // Optionally migrate invalid status values (e.g., "Currently Renting" to "Occupied")
  if (this.status === 'Currently Renting') {
    this.status = 'Occupied'; // Or another valid enum value, depending on your needs
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);