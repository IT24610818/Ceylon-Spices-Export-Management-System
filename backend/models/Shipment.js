const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  shippingMethod: {
    type: String,
    enum: ['Air', 'Sea'],
    required: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  carrier: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Processing', 'Dispatched', 'In Transit', 'Customs Clearance', 'Delivered'],
    default: 'Processing',
  },
  departurePort: {
    type: String,
    trim: true,
  },
  destinationPort: {
    type: String,
    trim: true,
  },
  departureDate: {
    type: Date,
  },
  estimatedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
});

module.exports = mongoose.model('Shipment', shipmentSchema);
