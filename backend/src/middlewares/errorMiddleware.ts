import { Request, Response, NextFunction } from 'express';

// Middleware to handle routes that are not found
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass error to the next middleware (errorHandler)
};

// General error handling middleware (should be the last middleware used)
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // next is required even if not used for Express error handlers
) => {
  // Determine the status code: use the response status code if set, otherwise default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  console.error("Error Caught:", err.stack); // Log the full error stack for debugging

  res.json({
    message: err.message, // Send back the error message
    // Optionally send stack trace in development mode only
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}; 