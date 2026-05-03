const { Product, Category } = require('../models/Product');

const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('createdBy', 'name email role');
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('createdBy', 'name email role');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, scientificName, category, grade, description, quantity, unit, pricePerUnit, image, availabilityStatus } = req.body;

    if (!name || !category || quantity === undefined || pricePerUnit === undefined) {
      return res.status(400).json({ message: 'name, category, quantity and pricePerUnit are required' });
    }

    const product = await Product.create({
      name,
      scientificName,
      category,
      grade,
      description,
      quantity,
      unit,
      pricePerUnit,
      image,
      availabilityStatus,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allowedFields = ['name', 'scientificName', 'category', 'grade', 'description', 'quantity', 'unit', 'pricePerUnit', 'image', 'availabilityStatus'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

const uploadProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    product.image = req.file.path;
    await product.save();

    return res.status(200).json({
      message: 'Image uploaded successfully',
      image: product.image,
    });
  } catch (error) {
    return next(error);
  }
};

// Category Controllers (Part of Product Module)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getCategories,
};
