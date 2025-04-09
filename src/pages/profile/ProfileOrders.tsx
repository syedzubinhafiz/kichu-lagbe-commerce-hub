
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { getOrdersByUserId } from '@/data/mockData';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Clock,
  CheckCircle,
  TruckIcon,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in, if not redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load orders for this user
    const loadOrders = () => {
      setIsLoading(true);
      try {
        if (user) {
          const userOrders = getOrdersByUserId(user.id);
          setOrders(userOrders);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user, isAuthenticated, navigate]);

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => 
    order.status === 'processing' || order.status === 'out_for_delivery'
  );
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  // Get status icon based on order status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'out_for_delivery':
        return <TruckIcon className="h-5 w-5 text-brand-primary" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base">Order #{order.id}</CardTitle>
            <CardDescription>{new Date(order.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <Badge variant={
            order.status === 'completed' 
              ? 'outline'
              : order.status === 'cancelled' 
                ? 'destructive' 
                : order.status === 'processing'
                  ? 'secondary'
                  : 'default'
          }>
            {order.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Items */}
          <div>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 flex-shrink-0 rounded border overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-medium">৳{item.price}</div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          {/* Order Summary */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-brand-primary">৳{order.totalAmount}</span>
          </div>
          
          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Order Timeline</h4>
              <div className="space-y-2">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {getStatusIcon(history.status)}
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {history.status.replace('_', ' ')}
                        {history.note && ` - ${history.note}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {order.status === 'completed' && (
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">View and track your orders</p>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-medium">No orders yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link to="/products">
              <Button className="bg-brand-primary hover:bg-brand-dark mt-4">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                In Progress ({processingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>
            
            <TabsContent value="pending">
              {pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No pending orders</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="processing">
              {processingOrders.length > 0 ? (
                processingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No orders in progress</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedOrders.length > 0 ? (
                completedOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No completed orders</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {cancelledOrders.length > 0 ? (
                cancelledOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No cancelled orders</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfileOrders;
