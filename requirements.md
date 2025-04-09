# **Technical Assessment: E-commerce lagbe-kichu.xyz**

# Project Overview

Develop a full-stack e-commerce web application with three user types: Admin, Seller, and Buyer. The platform will support product listing, ordering, and order management while incorporating a secure and scalable architecture.

The assessment evaluates a candidate's ability to build a real-world platform using modern tools, clean architecture, and best practices.

# Technical Requirements

**Frontend**

* **Framework:** Next.js 14+ with App Router

* **Language:** TypeScript

* **State Management:** Redux Toolkit with RTK Query

* **Styling/UI:** Your choice (e.g., TailwindCSS, ChakraUI)

* **Form Handling:** React Hook Form \+ Zod (Recommended)

* **Authentication**: Cookie-based with refresh token mechanism **(Bonus)**

**Backend**

* **Framework:** Express.js

* **Language:** TypeScript

* **Database:** MongoDB with Mongoose

  * **Bonus:** PostgreSQL with Prisma

* **Authentication:** JWT (access and refresh tokens)

* **Validation:** Zod or Yup

* **Architecture:** Modular, service-based separation **(Bonus)**

# Core Features by User Role

# Admin Portal

* Admin-only login

* Role-based access control

* View all users (buyers/sellers)

* Ban/Suspend user accounts

# Seller Portal

## **Roles (Optional Enhancements):**

* Manager: Full access to product and order modules

* Accountant: View orders and payment info

* Inventory Staff: Add/edit product details only

## **Modules:**

* Authentication & secure session

* Add/Edit/Delete Products:

  * Title, description, category, price

  * Multiple image uploads

  * One preview video per product

* Order Management:

  * View own orders

  * Approve or reject orders

  * Mark as: “Processing”, “Out for Delivery”, “Completed”

* Dashboard (Optional Bonus): View order stats, product performance

### 

# Buyer Features

* Authentication & secure session

* Browse/search products by:

  * Category, name, price

* Product Detail View:

  * Images, video, description, seller info

  * Discounted price with real-time countdown

* Add to Cart and Checkout:

  * Cash on Delivery

  * Bkash sandbox payment **(Bonus)**

* Order Tracking:

  * View current status and history

  * Statuses: Pending, Processing, Out for Delivery, Completed

* Leave reviews/ratings (Optional)

## 

# Order Lifecycle

| Status | Triggered By | Notes |
| :---- | :---- | :---- |
| Pending Approval | Buyer | After checkout |
| Processing | Seller | After the seller approves |
| Out for Delivery | Seller | When dispatched |
| Completed | Seller | After the buyer confirms delivery |
| Cancelled/Rejected | Seller | If the order is not accepted or invalid |

Each update must be timestamped and visible to both buyer and seller.

## 

# 

# 

# 

# 

# 

# Optional Features (Bonus Points)

* Admin analytics dashboard

* Email notifications for order status

* Real-time updates with WebSockets

* Image uploads via free cloud service (e.g., Cloudinary)

* Role-specific dashboards (Seller, Admin)

* Multi-seller support per product (complex, bonus)

# Evaluation Criteria

| Category | Weight | Description |
| :---- | :---- | :---- |
| Code Quality | 40% | Clean architecture, modularization, proper use of TypeScript |
| Feature Completion | 30% | Full CRUD, order lifecycle, auth, and role logic |
| State Management | 15% | Effective usage of RTK Query and frontend state |
| Database Design | 10% | Mongo schema quality or Prisma models if PostgreSQL is used |
| Bonus Features | 5% | Refresh token, analytics, real-time, email, file uploads, etc. |

# 

# 

# Submission Instructions

* Push the project to a public GitHub repository

* Include:

  * README.md with clear setup instructions

  * .env.example file

  * Database seed or mock data

  * Frontend and backend folders clearly separated

* Go to [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSf9LcQByDNDaVEjPMJnLA3TBr93XfO12z8GwNGnWUB4Oqrfxw/viewform?usp=sharing) and submit your solution, CV, and information.

* Deployment (Bonus): Host on Vercel, Render, or any free platform

## **Time Frame:**

* Recommended: 3–5 days

* Maximum: 7 days