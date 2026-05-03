const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Rejected'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  invoiceDate: {
    type: Date,
  },
  pdfUrl: {
    type: String,
  },
  receiptImage: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  hiddenByClient: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
