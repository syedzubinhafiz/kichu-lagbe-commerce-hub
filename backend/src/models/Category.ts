// backend/src/models/Category.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface defining the Category document structure
export interface ICategory extends Document {
  name: string;
  slug: string; // URL-friendly identifier
  image?: string; // Added optional image field
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Category
const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true, // Ensure category names are unique
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      unique: true, // Ensure slugs are unique
      lowercase: true,
      // Basic slug validation (can be enhanced)
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    image: { // Added optional image field definition
        type: String,
        // Add URL validation if desired
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook example (optional): Generate slug from name if not provided
// CategorySchema.pre<ICategory>('save', function (next) {
//   if (!this.slug && this.isModified('name')) {
//     this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
//   }
//   next();
// });

// Create and export the Category model
const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
