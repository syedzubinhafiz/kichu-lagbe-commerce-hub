import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json()); // Allows us to accept JSON data in the body

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('API Running');
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
}); 