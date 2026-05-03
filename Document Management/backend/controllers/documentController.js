const Document = require('../models/Document');
const Order = require('../models/Order');
const Client = require('../models/Client');

const getDocuments = async (req, res, next) => {
  try {
    let filter = {};
    const { orderId } = req.query;

    if (req.user.role === 'client') {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(200).json([]);
      }
      const orders = await Order.find({ clientId: client._id }).select('_id');
      const orderIds = orders.map((order) => order._id);
      filter = { orderId: { $in: orderIds }, hiddenByClient: { $ne: true } };
    }

    if (orderId) {
      filter.orderId = orderId;
    }

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name email role')
      .populate('orderId', 'status paymentStatus clientId');

    return res.status(200).json(documents);
  } catch (error) {
    return next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email role')
      .populate({
        path: 'orderId',
        select: 'status paymentStatus clientId',
        populate: {
          path: 'clientId',
          select: 'userId companyName'
        }
      });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Permission Check: If client, ensure they own the linked order
    if (req.user.role === 'client' && document.orderId && document.orderId.clientId) {
      const ownerId = document.orderId.clientId.userId.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this document' });
      }
    }

    return res.status(200).json(document);
  } catch (error) {
    return next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const { title, type, orderId, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'A document file is required' });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Linked order not found' });
      }
    }

    const document = await Document.create({
      title,
      type,
      fileUrl: req.file.path, // Cloudinary URL
      orderId,
      uploadedBy: req.user.id,
      status,
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'name email role')
      .populate('orderId', 'status paymentStatus clientId');

    return res.status(201).json(populatedDocument);
  } catch (error) {
    return next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const { title, type, orderId } = req.body;

    if (title) document.title = title;
    if (type) document.type = type;
    if (orderId !== undefined) document.orderId = orderId || null;

    // If a new file is uploaded, update the fileUrl
    if (req.file) {
      document.fileUrl = req.file.path; // Cloudinary URL
    }

    await document.save();

    const updatedDocument = await Document.findById(document._id)
      .populate('uploadedBy', 'name email role')
      .populate({
        path: 'orderId',
        select: 'status paymentStatus clientId',
        populate: {
          path: 'clientId',
          select: 'userId companyName'
        }
      });

    return res.status(200).json(updatedDocument);
  } catch (error) {
    return next(error);
  }
};

const hideDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate({
        path: 'orderId',
        populate: { path: 'clientId' }
      });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Permission Check: Ensure client owns the linked order to hide it
    if (req.user.role === 'client') {
      if (!document.orderId || !document.orderId.clientId || String(document.orderId.clientId.userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden: You can only hide your own documents' });
      }
    }

    document.hiddenByClient = true;
    await document.save();

    return res.status(200).json({ success: true, message: 'Document removed from your view' });
  } catch (error) {
    return next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.deleteOne();
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  hideDocument,
};
