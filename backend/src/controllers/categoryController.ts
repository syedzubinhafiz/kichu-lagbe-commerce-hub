import { Request, Response } from 'express';
import CategoryModel from '../models/Category'; // Assuming Category model exists

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    console.log('[Backend] Entering getCategories controller...');
    const categories = await CategoryModel.find().sort({ name: 1 }); // Find all, sort by name
    console.log(`[Backend] Found ${categories.length} categories.`);
    res.json(categories);
  } catch (error: any) {
    console.error('[Backend] Get Categories Error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

