import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

// Define the Order Status enum based on requirements
export enum OrderStatus {
  PendingApproval = 'Pending Approval', // After buyer checkout
  Processing = 'Processing', // After seller approves
  OutForDelivery = 'Out for Delivery', // When dispatched by seller
  Completed = 'Completed', // After buyer confirms delivery (or auto-confirm)
  Cancelled = 'Cancelled', // If rejected by seller or cancelled by buyer/admin
  Rejected = 'Rejected' // If seller does not accept
}

// Interface for status history entries
interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  updatedBy?: IUser['_id']; // Optional: track who updated the status (Seller/Admin)
}

// Interface representing an Order document in MongoDB.
export interface IOrder extends Document {
  buyer: IUser['_id'];
  seller: IUser['_id']; // Denormalized for easier querying by seller
  product: IProduct['_id'];
  quantity: number; // Assuming quantity per order item
  totalPrice: number; // Calculated total price for the order item
  paymentMethod: 'Cash on Delivery' | 'Bkash'; // Extendable later
  currentStatus: OrderStatus;
  statusHistory: IStatusHistory[];
  shippingAddress: { // Basic shipping address structure
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface representing the static methods of the model.
export interface IOrderModel extends Model<IOrder> {}

const StatusHistorySchema: Schema<IStatusHistory> = new Schema({
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  }
}, { _id: false }); // Don't create separate IDs for history entries

const OrderSchema: Schema<IOrder> = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: { // Store seller ID directly on the order for easier access
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Bkash'],
        required: true,
        default: 'Cash on Delivery'
    },
    currentStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PendingApproval,
      required: true,
    },
    statusHistory: {
        type: [StatusHistorySchema],
        default: [{ status: OrderStatus.PendingApproval, timestamp: new Date() }] // Initialize with pending status
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
      }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Indexing for common query patterns
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ product: 1 });
OrderSchema.index({ currentStatus: 1 });

const OrderModel = mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);

export default OrderModel; 