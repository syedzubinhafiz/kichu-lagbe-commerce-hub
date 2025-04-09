import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }
    
    console.log('[DB] Attempting to connect to MongoDB using URI:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI);
    
    // Log connection details
    const dbName = conn.connection.db ? conn.connection.db.databaseName : 'N/A';
    console.log(`[DB] MongoDB Connected: ${conn.connection.host} - Database: ${dbName}`);
    
  } catch (err: any) {
    console.error('[DB] MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 