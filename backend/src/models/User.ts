import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User Role enum
export enum UserRole {
  Admin = 'admin',
  Seller = 'seller',
  Buyer = 'buyer',
}

// Interface representing a document in MongoDB.
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean; // Used for ban/suspend status
  createdAt: Date;
  updatedAt: Date;
  // Method to compare passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface representing the static methods of the model.
export interface IUserModel extends Model<IUser> {
  // Add static methods here if needed in the future
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email validation
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // By default, don't return password field in queries
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Buyer, // Default role is Buyer
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Users are active by default
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Need to select the password field explicitly as it's excluded by default
  const user = await UserModel.findById(this._id).select('+password').exec();
  if (!user) {
    return false;
  }
  return bcrypt.compare(candidatePassword, user.password);
};

const UserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default UserModel; 