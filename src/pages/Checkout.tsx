
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CreditCard, 
  CircleDollarSign, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
}

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Calculate order totals
  const shippingCost = cart.totalAmount > 2000 ? 0 : 120;
  const totalWithShipping = cart.totalAmount + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    let isValid = true;
    
    // Required fields
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'streetAddress', 'city', 'state', 'zipCode'] as const;
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Phone number validation
    const phoneRegex = /^(\+?[0-9]{10,15})$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show toast for form validation error
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to create order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Order successfully created
      clearCart();
      navigate('/order/success', { 
        state: { 
          orderId: Math.random().toString(36).substring(2, 10).toUpperCase(),
          paymentMethod 
        } 
      });
      
      toast.success("Your order has been placed successfully!");
    } catch (error) {
      toast.error("Failed to place order. Please try again later.");
      console.error("Order submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your order</p>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping information */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetAddress">Street Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      className={errors.streetAddress ? 'border-red-500' : ''}
                    />
                    {errors.streetAddress && (
                      <p className="text-xs text-red-500">{errors.streetAddress}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500">{errors.city}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Division <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state/division"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500">{errors.state}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter your zip/postal code"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-xs text-red-500">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Additional Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Notes about your order, e.g. special notes for delivery"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className={`flex items-center space-x-2 rounded-md border p-4 ${paymentMethod === 'cod' ? 'border-brand-primary bg-brand-light/30' : ''}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center">
                      <CircleDollarSign className="h-5 w-5 mr-2 text-brand-primary" />
                      <div>
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">Pay with cash when your order is delivered</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-2 rounded-md border p-4 ${paymentMethod === 'bkash' ? 'border-brand-primary bg-brand-light/30' : ''}`}>
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-brand-primary" />
                      <div>
                        <span className="font-medium">bKash Payment</span>
                        <p className="text-sm text-gray-500">Pay using bKash mobile banking (Sandbox Mode)</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-lg border p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="divide-y">
                  {cart.items.map(item => (
                    <div key={item.productId} className="py-3 flex justify-between">
                      <div className="flex items-start">
                        <div className="h-12 w-12 flex-shrink-0 rounded border overflow-hidden mr-3">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.product.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        ৳{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>৳{cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `৳${shippingCost.toFixed(2)}`}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-brand-primary">৳{totalWithShipping.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-brand-primary hover:bg-brand-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Place Order <ChevronRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                
                <div className="mt-4 space-y-2">
                  <p className="text-xs flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">Secure checkout</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    By placing your order, you agree to our terms and conditions
                  </p>
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/cart')}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Checkout;
