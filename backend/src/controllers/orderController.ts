import { Response } from 'express';
import OrderModel, { IOrder, OrderStatus } from '../models/Order';
import ProductModel from '../models/Product';
import { AuthRequest } from '../middlewares/authMiddleware';
import UserModel, { UserRole, IUser } from '../models/User';
import { z } from 'zod';
import mongoose from 'mongoose';

// Zod Schema for creating an Order
const createOrderSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid Product ID' }),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['Cash on Delivery', 'Bkash']).default('Cash on Delivery'),
});

// Zod Schema for updating Order Status
const updateOrderStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus)
});

// Helper function to check allowed status transitions (basic example)
const canTransition = (current: OrderStatus, next: OrderStatus, role: UserRole): boolean => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PendingApproval]: [OrderStatus.Processing, OrderStatus.Rejected, OrderStatus.Cancelled],
        [OrderStatus.Processing]: [OrderStatus.OutForDelivery, OrderStatus.Cancelled],
        [OrderStatus.OutForDelivery]: [OrderStatus.Completed, OrderStatus.Cancelled], // Assuming seller marks completed
        [OrderStatus.Completed]: [], // Final state
        [OrderStatus.Rejected]: [], // Final state
        [OrderStatus.Cancelled]: [] // Final state
    };

    // Basic role checks
    if (role === UserRole.Buyer) {
        // Buyers might only be allowed to cancel under certain conditions (e.g., before processing)
        return next === OrderStatus.Cancelled && current === OrderStatus.PendingApproval;
    }
    if (role === UserRole.Seller || role === UserRole.Admin) {
        // Sellers/Admins can perform most transitions
        return transitions[current]?.includes(next) ?? false;
    }

    return false;
};


// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Buyer
export const createOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });

  try {
    const validatedData = createOrderSchema.parse(req.body);
    const { productId, quantity, shippingAddress, paymentMethod } = validatedData;

    // Find the product being ordered
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate total price (simplistic example)
    const totalPrice = product.price * quantity;

    // Create the order
    const order = new OrderModel({
      buyer: req.user._id,
      seller: product.seller, // Get seller from the product
      product: productId,
      quantity,
      totalPrice,
      shippingAddress,
      paymentMethod,
      currentStatus: OrderStatus.PendingApproval,
      // statusHistory is initialized by default in the model
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Invalid Product ID format' });
    }
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Buyer owns, Seller involved, or Admin)
export const getOrderById = async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });

  try {
    const order = await OrderModel.findById(req.params.id)
                                  .populate<{ buyer: Pick<IUser, '_id' | 'name' | 'email'> }>('buyer', 'name email')
                                  .populate<{ seller: Pick<IUser, '_id' | 'name' | 'email'> }>('seller', 'name email')
                                  .populate('product', 'title price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if buyer/seller properties exist (after typed populate)
    const isBuyer = order.buyer?._id?.toString() === req.user._id.toString();
    const isSeller = order.seller?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.Admin;

    if (isBuyer || isSeller || isAdmin) {
      res.json(order);
    } else {
      res.status(403).json({ message: 'User not authorized to view this order' });
    }
  } catch (error: any) {
     if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Order not found (invalid ID format)' });
    }
    console.error('Get Order By ID Error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @desc    Get logged in user's orders (Buyer)
// @route   GET /api/orders/myorders
// @access  Private/Buyer
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });

  try {
    const orders = await OrderModel.find({ buyer: req.user._id })
                                   .populate('seller', 'name email')
                                   .populate('product', 'title price images')
                                   .sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (error: any) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Get orders for a seller
// @route   GET /api/orders/sellerorders
// @access  Private/Seller
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });

    try {
        const orders = await OrderModel.find({ seller: req.user._id })
                                       .populate('buyer', 'name email')
                                       .populate('product', 'title price')
                                       .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
        console.error('Get Seller Orders Error:', error);
        res.status(500).json({ message: 'Server error fetching seller orders' });
    }
};


// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller or Admin)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user?._id || !req.user.role) return res.status(401).json({ message: 'Not authorized' });

  try {
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const { status: nextStatus } = validatedData;

    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check: order.seller should be an ObjectId
    // Check it exists before calling toString()
    const isSeller = order.seller?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.Admin;

    if (!isSeller && !isAdmin) {
        return res.status(403).json({ message: 'User not authorized to update this order status' });
    }

    // Check transition validity
    if (!canTransition(order.currentStatus, nextStatus, req.user.role)) {
        return res.status(400).json({ message: `Invalid status transition from ${order.currentStatus} to ${nextStatus} for role ${req.user.role}` });
    }

    order.currentStatus = nextStatus;
    order.statusHistory.push({ status: nextStatus, timestamp: new Date(), updatedBy: req.user._id });

    const updatedOrder = await order.save();

    // TODO: Implement email notifications (bonus)

    res.json(updatedOrder);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Order not found (invalid ID format)' });
    }
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
}; 