import { Response } from 'express';
import ProductModel, { IProduct } from '../models/Product';
import UserModel, { UserRole, IUser } from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware'; // Import augmented Request type
import { z } from 'zod';
import mongoose from 'mongoose'; // Import mongoose for ObjectId check if needed

// Zod Schema for creating/updating a Product
const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be a positive number'),
  images: z.array(z.string().url('Invalid URL format')).min(1, 'At least one image URL is required'),
  previewVideo: z.string().url('Invalid URL format').optional(),
  discountPrice: z.number().positive('Discount price must be positive').optional(),
  discountCountdown: z.string().datetime().optional(), // Expect ISO string from frontend
});

// Extend the schema for updates (make fields optional)
const updateProductSchema = productSchema.partial();

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Seller
export const createProduct = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });

  try {
    const validatedData = productSchema.parse(req.body);

    const product = new ProductModel({
      ...validatedData,
      seller: req.user._id, // Assign seller from authenticated user
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Get all products (public access, with filtering/searching)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    // Basic Filtering/Searching (can be expanded)
    const query = req.query;
    const filter: any = {};

    if (query.category) {
      filter.category = query.category as string;
    }
    if (query.sellerId) { // Allow filtering by seller
      filter.seller = query.sellerId as string;
    }
    if (query.search) {
      filter.$text = { $search: query.search as string };
    }
    if (query.minPrice) {
      filter.price = { ...filter.price, $gte: Number(query.minPrice) };
    }
    if (query.maxPrice) {
      filter.price = { ...filter.price, $lte: Number(query.maxPrice) };
    }

    const products = await ProductModel.find(filter).populate('seller', 'name email'); // Populate seller info
    res.json(products);
  } catch (error: any) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      'seller',
      'name email'
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    console.error('Get Product By ID Error:', error);
    // Handle CastError if ID format is invalid
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller (only the seller who created it)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  // Check if user exists on request (added guard clause)
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authorized, user information missing' });
  }

  try {
    const validatedData = updateProductSchema.parse(req.body);
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Explicit check and comparison using toString()
    if (!product.seller || product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'User not authorized to update this product' });
    }

    Object.assign(product, validatedData);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller (only the seller who created it)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
   // Check if user exists on request (added guard clause)
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Not authorized, user information missing' });
  }

  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Explicit check and comparison using toString()
    if (!product.seller || product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'User not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ message: 'Product removed successfully' });
  } catch (error: any) {
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found (invalid ID format)' });
    }
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
}; 