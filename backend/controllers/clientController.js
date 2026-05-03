const Client = require('../models/Client');
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

const getClients = async (req, res, next) => {
  try {
    let data;
    
    if (req.user.role === 'admin') {
      // Admin sees ALL users (Admin, Staff, Clients)
      const users = await User.find().select('-passwordHash');
      
      // Get all client profiles to merge
      const clientProfiles = await Client.find();
      
      data = users.map(user => {
        const profile = clientProfiles.find(p => String(p.userId) === String(user._id));
        return {
          _id: profile ? profile._id : user._id,
          userId: user,
          companyName: profile ? profile.companyName : user.companyName || user.name,
          email: user.email,
          country: profile ? profile.country : 'Internal',
          phone: profile ? profile.phone : '',
          clientCode: profile ? profile.clientCode : 'N/A',
          isInternal: !profile,
          isActive: user.isActive,
          role: user.role
        };
      });
    } else {
      // Staff sees ONLY Clients
      data = await Client.find().populate('userId', 'name email role');
    }

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id).populate('userId', 'name email role');
    
    if (!client) {
      // It might be a direct User ID (for Admin/Staff)
      const user = await User.findById(req.params.id).select('-passwordHash');
      if (user) {
        return res.status(200).json({ 
          success: true, 
          data: {
            _id: user._id,
            userId: user,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName || user.name,
            isActive: user.isActive,
            isInternal: true
          }
        });
      }
      return res.status(404).json({ message: 'User or Client not found' });
    }

    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    return next(error);
  }
};

const getClientOrders = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      // Internal users don't have orders as clients
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const orders = await Order.find({ clientId: client._id })
      .populate('clientId', 'companyName email phone')
      .populate('products.productId', 'name category pricePerUnit');

    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, country, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || 'client';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
      companyName: companyName || '',
    });

    let clientProfile = null;
    if (userRole === 'client') {
      clientProfile = await Client.create({
        userId: user._id,
        companyName: companyName || name,
        email: user.email,
        country: country || 'Not Specified',
        phone: phone || '',
      });
    }

    return res.status(201).json({
      success: true,
      data: clientProfile ? { ...clientProfile._doc, userId: user } : { userId: user, isInternal: true }
    });
  } catch (error) {
    return next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user;
    let clientProfile = await Client.findById(id);

    if (clientProfile) {
      // It's a client profile ID
      user = await User.findById(clientProfile.userId);
    } else {
      // It might be a user ID directly (for Admin/Staff)
      user = await User.findById(id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update User fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase().trim();
    if (req.body.role) user.role = req.body.role;
    if (req.body.companyName) user.companyName = req.body.companyName;
    
    await user.save();

    // Update Client fields if profile exists
    if (clientProfile) {
      const allowedClientFields = ['companyName', 'email', 'country', 'phone'];
      allowedClientFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          clientProfile[field] = req.body[field];
        }
      });
      await clientProfile.save();
    }

    return res.status(200).json({ 
      success: true, 
      data: clientProfile ? { ...clientProfile._doc, userId: user } : { userId: user, isInternal: true }
    });
  } catch (error) {
    return next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    let clientProfile = await Client.findById(id);
    let userId;

    if (clientProfile) {
      userId = clientProfile.userId;
      await clientProfile.deleteOne();
    } else {
      userId = id;
    }

    const user = await User.findById(userId);
    if (user) {
      // Prevent deleting self
      if (String(user._id) === String(req.user.id)) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      await user.deleteOne();
    }

    return res.status(200).json({ success: true, message: 'User and profile deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let clientProfile = await Client.findById(id);
    let userId = clientProfile ? clientProfile.userId : id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent banning self
    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  getClientOrders,
  createClient,
  updateClient,
  deleteClient,
  toggleUserStatus,
};
