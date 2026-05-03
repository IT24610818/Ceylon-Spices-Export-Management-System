const mongoose = require('mongoose');
const Order = require('../models/Order');
const { Product } = require('../models/Product');
const Client = require('../models/Client');

const getOrders = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'client') {
      const client = await Client.findOne({ userId: req.user.id });
      if (client) {
        filter = { clientId: client._id, hiddenForClient: false };
      } else {
        // If no client profile yet, return empty list
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'clientId',
        select: 'companyName email phone country userId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('products.productId', 'name category pricePerUnit')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { products, notes } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products array is required' });
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of products) {
      if (!item.productId || item.quantity === undefined) {
        return res.status(400).json({ message: 'Each product needs productId and quantity' });
      }

      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: `Invalid productId: ${item.productId}` });
      }

      if (Number(item.quantity) <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than zero' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < Number(item.quantity)) {
        return res.status(400).json({
          message: `Insufficient quantity for product ${product.name}`,
        });
      }

      const unitPrice = product.pricePerUnit;
      totalAmount += unitPrice * Number(item.quantity);

      normalizedItems.push({
        productId: product._id,
        quantity: Number(item.quantity),
        unitPrice,
      });
    }

    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found. Please complete your profile first.' });
    }

    const order = await Order.create({
      clientId: client._id,
      products: normalizedItems,
      totalAmount,
      status: 'Pending',
      notes,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'clientId',
        select: 'companyName email phone country userId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('products.productId', 'name category pricePerUnit');

    return res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const allowedStatuses = ['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // --- STOCK LOGIC START ---
    const oldStatus = order.status;

    // 1. If transitioning TO Approved (Deduct Stock)
    if (status === 'Approved' && oldStatus !== 'Approved') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found during approval` });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}. Approval failed.` });
        }
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    // 2. If transitioning FROM Approved TO Cancelled (Restore Stock)
    if (status === 'Cancelled' && oldStatus === 'Approved') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }
    // --- STOCK LOGIC END ---

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'clientId',
        select: 'companyName email phone country userId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('products.productId', 'name category pricePerUnit');

    return res.status(200).json({ success: true, data: populatedOrder });
  } catch (error) {
    return next(error);
  }
};

const updateOrderItems = async (req, res, next) => {
  try {
    const { products, notes } = req.body;
    const orderId = req.params.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'products array is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Only the owner can edit
    const client = await Client.findOne({ userId: req.user.id });
    if (!client || order.clientId.toString() !== client._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this order' });
    }

    // Status Check: Only Pending can be edited
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be edited. This order is already being processed.' });
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const unitPrice = product.pricePerUnit;
      totalAmount += unitPrice * Number(item.quantity);

      normalizedItems.push({
        productId: product._id,
        quantity: Number(item.quantity),
        unitPrice,
      });
    }

    order.products = normalizedItems;
    order.totalAmount = totalAmount;
    if (notes !== undefined) order.notes = notes;
    
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'clientId',
        select: 'companyName email phone country userId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('products.productId', 'name category pricePerUnit');

    return res.status(200).json({ success: true, message: 'Order updated successfully', data: populatedOrder });
  } catch (error) {
    return next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the current client
    const client = await Client.findOne({ userId: req.user.id });
    if (!client || order.clientId.toString() !== client._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    if (order.status !== 'Pending' && !(order.status === 'Approved' && order.paymentStatus !== 'Paid')) {
      return res.status(400).json({ message: 'Only pending or unpaid approved orders can be cancelled' });
    }

    // Restore stock if it was already approved
    if (order.status === 'Approved') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    order.status = 'Cancelled';
    await order.save();

    return res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    return next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const hideOrderForClient = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the current client
    const client = await Client.findOne({ userId: req.user.id });
    if (!client || order.clientId.toString() !== client._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to modify this order' });
    }

    if (order.status !== 'Cancelled' && order.status !== 'Rejected') {
      // In your case status is 'Cancelled' mostly
    }

    order.hiddenForClient = true;
    await order.save();

    return res.status(200).json({ success: true, message: 'Order removed from your view' });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'clientId',
        select: 'companyName email phone country userId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('products.productId', 'name category pricePerUnit');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  hideOrderForClient,
  updateOrderItems,
};
