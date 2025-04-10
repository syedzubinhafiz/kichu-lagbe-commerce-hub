import express from 'express';
import { getCategories } from '../controllers/categoryController'; // Import from controller

const router = express.Router();

// Public route to get all categories
router.get('/', getCategories); // Use the imported function

export default router; // Ensure this line is present