# Kichu Lagbe - E-commerce Platform

Kichu Lagbe is a full-stack e-commerce platform built with React, TypeScript, and MongoDB. The name "Kichu Lagbe" means "Need Something" in Bengali, making it a perfect fit for an e-commerce solution.

## Features

### User Roles
- **Admin**: Manage users (ban/unban), view orders, view products.
- **Seller**: Manage own products (CRUD), manage orders related to own products (update status), view own sales.
- **Buyer**: Browse/search products, place orders, view own order history and status.

### Core Functionalities
- **Authentication**: Role-based secure login/registration system using JWT (Access + Refresh Tokens with HttpOnly cookie).
- **Product Management**: CRUD operations for products (Sellers), product browsing/searching (Public).
- **Order Management**: Order creation (Buyers), order viewing (Buyers, Seller involved, Admin), order status updates following lifecycle (Sellers, Admin).
- **Admin User Management**: View all users, Ban/Unban users.
- **Responsive Design**: Mobile-first approach for all device compatibility (Frontend responsibility).

## Tech Stack

### Frontend
- **Framework**: Vite + React
- **Language**: TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Routing**: React Router
- **State Management/Data Fetching**: Tanstack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Runtime**: Node.js

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- MongoDB database (local instance or a cloud service like MongoDB Atlas - a free tier is available)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/kichu-lagbe.git # Replace with your repo URL
    cd kichu-lagbe
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    # or yarn install
    cd ..
    ```

### Environment Variables Setup

**Backend:**

1.  Navigate to the `backend` directory.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Edit the `.env` file in the `backend` directory and provide your actual values:
    ```dotenv
    # MongoDB Connection String (replace with your actual connection string)
    MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<database-name>?retryWrites=true&w=majority

    # JWT Secrets (generate strong random strings for these)
    # Example generation command: openssl rand -base64 32
    JWT_ACCESS_SECRET=YOUR_STRONG_ACCESS_SECRET_HERE
    JWT_REFRESH_SECRET=YOUR_STRONG_REFRESH_SECRET_HERE

    # Port the backend server will run on
    PORT=5000
    ```

**Frontend:**

*   (If the frontend needs environment variables, e.g., for the API base URL if it's not relative, add instructions here. Currently, the frontend likely calls `/api/...` which works if served from the same domain or proxied).*

### Running the Application

1.  **Run the Backend Server:**
    Open a terminal in the `backend` directory:
    ```bash
    npm run dev
    ```
    The backend API will start, typically on `http://localhost:5000` (or the `PORT` specified in `backend/.env`). You should see messages indicating MongoDB connection and the server starting.

2.  **Run the Frontend Development Server:**
    Open another terminal in the main project root directory (`kichu-lagbe`):
    ```bash
    npm run dev
    ```
    The frontend application will open in your browser, usually at `http://localhost:5173`.

*(Note: The backend includes CORS configuration allowing requests from `http://localhost:5173`. If your frontend runs on a different port, update the `origin` in `backend/src/server.ts`)*

## API Structure Overview

- **Authentication:** `/api/auth` (register, login, logout, refresh)
- **Products:** `/api/products` (CRUD, list, view)
- **Orders:** `/api/orders` (create, list own, list seller's, view, update status)
- **Admin:** `/api/admin/users` (list, view, update status)

*(Refer to the route files in `backend/src/routes/` for details)*

## Database Schema

The database schema is defined by the Mongoose models located in the `backend/src/models/` directory:

- `User.ts`: Defines the structure for Admin, Seller, and Buyer users, including roles and status.
- `Product.ts`: Defines the structure for products, including references to the seller.
- `Order.ts`: Defines the structure for orders, including buyer, seller, product, status history, and shipping details.

*(These models are the source of truth for the data structure.)*

## Demo Account Information

*(Keep or update this section if you seed demo users)*

For testing purposes, you can use these demo accounts:

- **Admin**: Register a user and manually update their role in the database to `admin`.
- **Seller**: Register a user with the role `seller` via `/api/auth/register` (if implemented) or update manually.
- **Buyer**: Register a new user normally (defaults to `buyer`).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
