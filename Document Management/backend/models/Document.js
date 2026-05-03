const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Invoice', 'Packing List', 'Certificate', 'Bill of Lading'],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  hiddenByClient: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Document', documentSchema);
