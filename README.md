
# Kichu Lagbe - E-commerce Platform

Kichu Lagbe is a full-stack e-commerce platform built with React, TypeScript, and MongoDB. The name "Kichu Lagbe" means "Need Something" in Bengali, making it a perfect fit for an e-commerce solution.

## Features

### User Roles
- **Admin**: Manage users, products, and orders
- **Seller**: Create/update products, manage orders, view sales analytics
- **Buyer**: Browse products, place orders, track deliveries

### Core Functionalities
- **Authentication**: Role-based secure login/registration system
- **Product Management**: CRUD operations for products with rich media support
- **Order Management**: Complete order lifecycle from cart to delivery
- **Responsive Design**: Mobile-first approach for all device compatibility

## Tech Stack

### Frontend
- **React**: UI library with TypeScript for type safety
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework for styling
- **shadcn/ui**: UI component library
- **React Context**: State management for auth and cart functionality
- **Lucide React**: Icon library

### Backend (Integration Instructions)
- **Express.js**: Backend framework with TypeScript
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication with access and refresh tokens

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm/yarn
- MongoDB database (local or cloud-based)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/kichu-lagbe.git
cd kichu-lagbe
```

2. Install frontend dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# JWT Secret Keys
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Optional: Cloud Storage (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Payment Gateway (for bKash integration)
BKASH_API_KEY=your_bkash_api_key
BKASH_API_SECRET=your_bkash_api_secret
```

## Backend Setup

To connect this frontend with a MongoDB backend:

1. Set up a MongoDB database (locally or using MongoDB Atlas)
2. Create an Express.js server with the following structure:

```
backend/
├── config/
│   └── db.js        # Database connection setup
├── controllers/     # Route controllers
├── middleware/      # Auth middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Helper functions
├── .env             # Environment variables
└── server.js        # Entry point
```

3. Implement the API endpoints for:
   - User authentication (register, login, refresh token)
   - Product CRUD operations
   - Order management
   - User management

4. Connect your backend to the frontend by updating the API base URL in the frontend code.

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (admin/seller/buyer),
  createdAt: Date,
  updatedAt: Date,
  isBanned: Boolean
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,
  description: String,
  price: Number,
  discountPrice: Number,
  discountEnds: Date,
  images: [String], // URLs
  videoUrl: String,
  categoryId: ObjectId,
  sellerId: ObjectId,
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: String (pending/processing/out_for_delivery/completed/cancelled),
  shippingAddress: {
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    phoneNumber: String
  },
  paymentMethod: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date,
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      note: String
    }
  ]
}
```

## Demo Account Information

For testing purposes, you can use these demo accounts:

- **Admin**: admin@kichulage.com (any password)
- **Seller**: seller@kichulage.com (any password)
- **Buyer**: Register a new account or use the profile created during registration

## License

This project is licensed under the MIT License - see the LICENSE file for details.
