import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import cors from 'cors'; // Import cors
import connectDB from './config/db';
import authRoutes from './routes/authRoutes'; // Import auth routes
import productRoutes from './routes/productRoutes'; // Import product routes
import orderRoutes from './routes/orderRoutes'; // Import order routes
import adminRoutes from './routes/adminRoutes'; // Import admin routes
import { notFound, errorHandler } from './middlewares/errorMiddleware'; // Import error handlers

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS Middleware - Configure allowed origins as needed
app.use(cors({ 
    origin: 'http://localhost:5173', // Allow frontend origin (adjust if different)
    credentials: true // Allow cookies to be sent
})); 

// Init Middleware
app.use(express.json()); // Allows us to accept JSON data in the body
app.use(cookieParser()); // Use cookie-parser middleware

// Define Routes
app.get('/', (req: Request, res: Response) => {
  res.send('API Running...'); // Updated message
});

app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/products', productRoutes); // Mount product routes
app.use('/api/orders', orderRoutes); // Mount order routes
app.use('/api/admin', adminRoutes); // Mount admin routes

// TODO: Add other routes (product, order, user, admin)

// Error Handling Middleware (must be last)
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle all other errors

app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
}); 