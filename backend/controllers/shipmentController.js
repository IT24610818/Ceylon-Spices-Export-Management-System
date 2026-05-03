const Shipment = require('../models/Shipment');
const Order = require('../models/Order');

const getShipments = async (req, res, next) => {
  try {
    let shipments = [];

    if (req.user.role === 'client') {
      const clientProfile = await require('../models/Client').findOne({ userId: req.user.id });
      if (!clientProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      const clientOrders = await Order.find({ clientId: clientProfile._id }).select('_id');
      const orderIds = clientOrders.map((order) => order._id);

      shipments = await Shipment.find({ orderId: { $in: orderIds } }).populate({
        path: 'orderId',
        populate: { path: 'clientId', select: 'name email role' },
      });
    } else {
      shipments = await Shipment.find().populate({
        path: 'orderId',
        populate: { path: 'clientId', select: 'name email role' },
      });
    }

    return res.status(200).json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    return next(error);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id).populate({
      path: 'orderId',
      populate: { path: 'clientId', select: 'name email role' },
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (req.user.role === 'client') {
      const clientProfile = await require('../models/Client').findOne({ userId: req.user.id });
      if (!shipment.orderId || String(shipment.orderId.clientId._id) !== String(clientProfile?._id)) {
        return res.status(403).json({ message: 'Forbidden: shipment access denied' });
      }
    }

    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    return next(error);
  }
};

const createShipment = async (req, res, next) => {
  try {
    const {
      orderId,
      shippingMethod,
      trackingNumber,
      carrier,
      status,
      departurePort,
      destinationPort,
      departureDate,
      estimatedDelivery,
      actualDelivery,
    } = req.body;

    if (!orderId || !shippingMethod) {
      return res.status(400).json({ message: 'orderId and shippingMethod are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Linked order not found' });
    }

    if (order.status !== 'Approved' || order.paymentStatus !== 'Paid') {
      return res.status(400).json({
        message: 'Shipment can be created only when order is Approved and paymentStatus is Paid',
      });
    }

    const shipment = await Shipment.create({
      orderId,
      shippingMethod,
      trackingNumber,
      carrier,
      status,
      departurePort,
      destinationPort,
      departureDate,
      estimatedDelivery,
      actualDelivery,
    });

    const populatedShipment = await Shipment.findById(shipment._id).populate({
      path: 'orderId',
      populate: { path: 'clientId', select: 'name email role' },
    });

    return res.status(201).json({ success: true, data: populatedShipment });
  } catch (error) {
    return next(error);
  }
};

const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const allowedFields = [
      'shippingMethod',
      'trackingNumber',
      'carrier',
      'status',
      'departurePort',
      'destinationPort',
      'departureDate',
      'estimatedDelivery',
      'actualDelivery',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        shipment[field] = req.body[field];
      }
    });

    await shipment.save();

    const populatedShipment = await Shipment.findById(shipment._id).populate({
      path: 'orderId',
      populate: { path: 'clientId', select: 'name email role' },
    });

    return res.status(200).json({ success: true, data: populatedShipment });
  } catch (error) {
    return next(error);
  }
};

const deleteShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Role-based logic: Staff can only delete if status is Delivered
    if (req.user.role === 'staff' && shipment.status !== 'Delivered') {
      return res.status(403).json({ 
        message: 'Staff members can only delete shipments that have been Delivered.' 
      });
    }

    // Admin can delete in any status (handled by middleware + no status check here)

    await shipment.deleteOne();
    return res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
};
