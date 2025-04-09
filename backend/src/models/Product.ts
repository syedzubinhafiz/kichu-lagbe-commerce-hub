import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User'; // Import User interface for referencing

// Interface representing a Product document in MongoDB.
export interface IProduct extends Document {
  seller: IUser['_id']; // Reference to the User (Seller)
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[]; // Array of image URLs
  previewVideo?: string; // Optional video URL
  // Optional fields from requirements/bonus
  discountPrice?: number;
  discountCountdown?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface representing the static methods of the model.
export interface IProductModel extends Model<IProduct> {}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String], // Array of strings (URLs)
      required: true,
      validate: [(v: string[]) => v.length > 0, 'At least one image is required'],
    },
    previewVideo: {
      type: String,
      // Add validation if needed (e.g., URL format)
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    discountCountdown: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Indexing for frequently searched fields
ProductSchema.index({ title: 'text', description: 'text', category: 1, price: 1 });

const ProductModel = mongoose.model<IProduct, IProductModel>(
  'Product',
  ProductSchema
);

export default ProductModel; 