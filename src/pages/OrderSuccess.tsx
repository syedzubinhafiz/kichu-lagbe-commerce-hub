
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentMethod } = location.state || { orderId: '', paymentMethod: 'cod' };

  React.useEffect(() => {
    // If there's no order ID, redirect to the home page
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Thank You For Your Order!</h1>
          <p className="text-lg text-gray-700 mb-8">
            Your order has been placed successfully. We've sent a confirmation email to your registered email address.
          </p>
        </div>
        
        <div className="bg-white rounded-lg border p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-lg font-bold mb-2">Order Details</h2>
              <p className="text-sm text-gray-600">Order #{orderId}</p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block bg-brand-light text-brand-primary font-medium px-3 py-1 rounded-full text-sm">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash Payment'}
              </span>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium mb-4">What's Next?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-600 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">1</span>
                <div>
                  <h4 className="font-medium">Order Processing</h4>
                  <p className="text-sm text-gray-600">
                    Your order is currently being processed. You'll receive an update once it's ready for shipping.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-100 text-gray-600 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">2</span>
                <div>
                  <h4 className="font-medium">Order Shipping</h4>
                  <p className="text-sm text-gray-600">
                    Once your order is ready, we'll dispatch it for delivery and update the status.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-100 text-gray-600 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">3</span>
                <div>
                  <h4 className="font-medium">Order Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to your specified address. {paymentMethod === 'cod' ? 'Please have the payment ready for our delivery partner.' : ''}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/profile/orders" className="flex-1">
            <Button className="w-full bg-brand-primary hover:bg-brand-dark">
              <Package className="mr-2 h-4 w-4" />
              Track Your Order
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderSuccess;
