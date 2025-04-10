import { Response } from 'express';
import ProductModel, { IProduct } from '../models/Product';
import CategoryModel from '../models/Category'; // Import CategoryModel
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

// @desc    Get all products (public access, with filtering/sorting)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: AuthRequest, res: Response) => {
  console.log('[Backend] Entering getProducts controller...'); // Log entry
  try {
    const { category, sellerId, search, minPrice, maxPrice, sortBy, discounted, inStock } = req.query;
    const filter: any = {};
    const sort: any = {};

    console.log('[Backend] Raw Query Params:', req.query);

    // Category Filtering: Need to find Category ObjectId based on slug
    if (category) {
        console.log(`[Backend] Filtering by category slug: ${category}`);
        const categoryDoc = await CategoryModel.findOne({ slug: category as string }).select('_id').lean(); // Use lean for plain object
        
        if (categoryDoc) {
            console.log(`[Backend] Found Category ID: ${categoryDoc._id}`);
            filter.category = categoryDoc._id; // Filter by the ObjectId
        } else {
            console.log(`[Backend] Category slug "${category}" not found in DB.`); 
            return res.json([]); 
        }
    }
    
    if (sellerId) {
        console.log(`[Backend] Filtering by seller ID: ${sellerId}`);
        filter.seller = sellerId as string;
    }
    if (search) {
      filter.$text = { $search: search as string };
    }
    
    const priceFilter: any = {};
    if (minPrice) {
        priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice) {
        priceFilter.$lte = Number(maxPrice);
    }
    // Apply price filter based on discountPrice or regular price
    if (Object.keys(priceFilter).length > 0) {
        filter.$or = [
            { price: priceFilter }, // Filter by regular price
            { discountPrice: priceFilter } // Filter by discount price
        ];
        // If filtering only discounted, the above might need adjustment
    }

    // Handle discounted filter
    if (discounted === 'true') {
        filter.discountPrice = { $exists: true, $ne: null };
        // Ensure discount is active (optional: check discountEnds date)
        // filter["discountEnds"] = { $gte: new Date() };
    }

    // Handle inStock filter (assuming stock > 0 means in stock)
    // Remove default filtering - let frontend control this
    // if (inStock === 'true' || inStock === undefined) { // Default to inStock=true
    //     filter.stock = { $gt: 0 };
    // }
    if (inStock === 'false') { // Only filter if explicitly set to false (show all)
        // No stock filter applied
    } else if (inStock === 'true') { // Only filter if explicitly set to true
         filter.stock = { $gt: 0 };
    } // Otherwise (undefined), show all

    // Handle sorting
    switch (sortBy) {
        case 'price_low':
            // Sort primarily by discountPrice, then price
            sort.discountPrice = 1;
            sort.price = 1;
            break;
        case 'price_high':
            sort.discountPrice = -1;
            sort.price = -1;
            break;
        case 'popular': // Assuming rating exists - add default if not
            sort.rating = -1;
            break;
        case 'newest':
        default:
            sort.createdAt = -1;
            break;
    }

    console.log('[Backend] Final Query Filter:', JSON.stringify(filter)); // Log the filter object
    console.log('[Backend] Final Sort Options:', JSON.stringify(sort)); // Log sort options

    const products = await ProductModel.find(filter)
                                       .populate('seller', 'name email') // Populate seller info
                                       .populate('category') // Added population for category
                                       .sort(sort); // Apply sorting

    console.log(`[Backend] Found ${products.length} products after filtering.`); // Log number of products found
                                       
    res.json(products);
  } catch (error: any) {
    console.error('[Backend] Get Products Error:', error); // Log any errors
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:identifier (where identifier is ID or slug)
// @access  Public
export const getProductByIdOrSlug = async (req: AuthRequest, res: Response) => {
  try {
    const identifier = req.params.identifier;
    let product;

    // Check if identifier looks like a MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await ProductModel.findById(identifier)
                                  .populate('seller', 'name email')
                                  .populate('category'); // Populate category details
    } else {
      // Assume it's a slug
      product = await ProductModel.findOne({ slug: identifier })
                                  .populate('seller', 'name email')
                                  .populate('category'); // Populate category details
    }

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    console.error('Get Product By ID/Slug Error:', error);
    // Handle CastError specifically if findById was attempted with an invalid format
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Product not found (invalid ID/slug format)' });
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
    // Use findById for updates as ID is more reliable
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

    // Prevent slug modification on update if needed (optional)
    // delete validatedData.slug;

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
    // Use findById for deletes
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