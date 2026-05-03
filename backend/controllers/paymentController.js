const Payment = require('../models/Payment');
const Order = require('../models/Order');

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `INV-${y}${m}${d}-${suffix}`;
};

const simulatedPay = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, amount, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Simulation: Generate a fake transaction ID
    const transactionId = 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const payment = await Payment.create({
      orderId: order._id,
      clientId: req.user.id,
      amount: amount || order.totalAmount,
      currency: 'USD',
      paymentMethod: paymentMethod || 'Credit Card',
      status: status || 'Paid',
      transactionId: transactionId,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date(),
    });

    // If card payment (auto-paid), update order status
    if (status === 'Paid') {
      await Order.findByIdAndUpdate(order._id, { paymentStatus: 'Paid' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Payment Recorded Successfully',
      paymentId: payment._id,
      transactionId
    });
  } catch (error) {
    return next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    payment.status = status;
    if (status === 'Rejected') {
      payment.rejectionReason = rejectionReason || 'Payment was rejected. Please check your details and try again.';
      // Reset order status so client can pay again
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'Pending' });
    }

    if (status === 'Paid') {
      payment.rejectionReason = undefined; // Clear reason if later approved
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'Paid' });
    }

    await payment.save();

    return res.status(200).json({ success: true, message: `Payment ${status} successfully`, data: payment });
  } catch (error) {
    return next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await payment.deleteOne();
    return res.status(200).json({ success: true, message: 'Payment record deleted' });
  } catch (error) {
    return next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'client') {
      filter = { clientId: req.user.id, hiddenByClient: { $ne: true } };
    }

    const payments = await Payment.find(filter)
      .populate('clientId', 'name email role')
      .populate({
        path: 'orderId',
        populate: { path: 'clientId' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    return next(error);
  }
};

const hidePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Only the owner (client) can hide their payment
    if (String(payment.clientId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: You can only hide your own payments' });
    }

    payment.hiddenByClient = true;
    await payment.save();

    return res.status(200).json({ success: true, message: 'Payment removed from your history' });
  } catch (error) {
    return next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('clientId', 'name email role')
      .populate({
        path: 'orderId',
        populate: { path: 'clientId' }
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

const uploadReceiptImage = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    payment.receiptImage = req.file.path;
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Receipt image uploaded successfully',
      image: payment.receiptImage,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  simulatedPay,
  updatePaymentStatus,
  deletePayment,
  hidePayment,
  getPayments,
  getPaymentById,
  uploadReceiptImage,
};
