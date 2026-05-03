const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  clientCode: {
    type: String,
    unique: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

clientSchema.pre('validate', async function generateClientCode(next) {
  try {
    if (!this.clientCode) {
      const count = await mongoose.model('Client').countDocuments();
      this.clientCode = `CLT-${String(count + 1).padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Client', clientSchema);
