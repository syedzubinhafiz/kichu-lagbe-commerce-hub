
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would validate the coupon against an API
    if (couponCode.toUpperCase() === 'KICHUFIRST') {
      setCouponError('');
      // Apply discount logic would go here
      alert('Coupon applied successfully! 10% discount applied.');
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  // Calculate shipping based on cart total
  const shippingCost = cart.totalAmount > 2000 ? 0 : 120;
  const totalWithShipping = cart.totalAmount + shippingCost;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Your Shopping Cart</h1>
        <p className="text-gray-600 mb-8">
          {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
        </p>

        {cart.items.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-medium">Your cart is empty</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Browse our products and find something you love!
            </p>
            <Link to="/products">
              <Button className="bg-brand-primary hover:bg-brand-dark mt-4">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0 rounded border overflow-hidden">
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <Link to={`/product/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-brand-primary">
                                {item.product.title}
                              </Link>
                              {item.product.discountPrice && (
                                <span className="text-xs text-green-600 block">
                                  On sale
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.product.discountPrice ? (
                              <>
                                <span className="font-medium">৳{item.product.discountPrice}</span>
                                <span className="text-xs text-gray-500 line-through ml-1">৳{item.product.price}</span>
                              </>
                            ) : (
                              <span className="font-medium">৳{item.product.price}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center border rounded-md w-24">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} 
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} 
                              disabled={item.product.stock <= item.quantity}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ৳{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Link to="/products">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cart summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳{cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? 'Free' : `৳${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-lg font-bold text-brand-primary">৳{totalWithShipping.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleApplyCoupon} className="mt-6">
                  <div className="space-y-2">
                    <label htmlFor="coupon" className="text-sm font-medium">
                      Coupon Code
                    </label>
                    <div className="flex">
                      <Input
                        id="coupon"
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button type="submit" className="rounded-l-none bg-gray-900">
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-600">{couponError}</p>
                    )}
                  </div>
                </form>

                <Button
                  className="w-full mt-6 bg-brand-primary hover:bg-brand-dark"
                  onClick={handleCheckout}
                  disabled={cart.items.length === 0}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Free shipping for orders above ৳2000
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Try coupon code "KICHUFIRST" for 10% off
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;
