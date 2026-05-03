const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, country, phone } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!name || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: role || 'client',
      companyName: companyName || '',
    });

    let clientData = {};
    if (user.role === 'client') {
      const client = await Client.create({
        userId: user._id,
        companyName: companyName || name,
        email: normalizedEmail,
        country: country || 'Not Specified',
        phone: phone || '',
      });
      clientData = {
        companyName: client.companyName,
        phone: client.phone,
        country: client.country,
      };
    }

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        ...clientData,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    let isMatch = await bcrypt.compare(normalizedPassword, user.passwordHash);
    if (!isMatch && normalizedPassword.trim() !== normalizedPassword) {
      // Tolerate accidental leading/trailing spaces in typed password.
      isMatch = await bcrypt.compare(normalizedPassword.trim(), user.passwordHash);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    let clientData = {};
    if (user.role === 'client') {
      const client = await Client.findOne({ userId: user._id });
      if (client) {
        clientData = {
          companyName: client.companyName,
          phone: client.phone,
          country: client.country,
        };
      }
    }

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        ...clientData,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toObject();
    let clientData = {
      companyName: userData.companyName || '',
      phone: '',
      country: ''
    };

    if (user.role === 'client') {
      const client = await Client.findOne({ userId: user._id });
      if (client) {
        clientData = {
          companyName: client.companyName || userData.companyName || '',
          phone: client.phone || '',
          country: client.country || ''
        };
      }
    }

    return res.status(200).json({
      ...userData,
      ...clientData
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, companyName, phone, country } = req.body;

    if (name) user.name = name;
    if (companyName) user.companyName = companyName;

    await user.save();

    // If it's a client, update the Client profile too
    if (user.role === 'client') {
      const client = await Client.findOne({ userId: user._id });
      if (client) {
        if (companyName) client.companyName = companyName;
        if (phone) client.phone = phone;
        if (country) client.country = country;
        if (user.email) client.email = user.email;
        await client.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: phone,
        country: country,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const uploadProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    user.profilePhoto = req.file.path;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
};
