
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Package,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UploadCloud,
  CheckCircle,
  XCircle,
  TruckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProducts, mockCategories, mockOrders } from '@/data/mockData';
import { Product, Order, OrderStatus } from '@/types';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if user is seller, if not redirect to home
  React.useEffect(() => {
    if (user?.role !== 'seller') {
      navigate('/');
      toast.error("Access denied. Seller rights required.");
    }
  }, [user, navigate]);

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would add the new product via API
    toast.success("Product added successfully!");
    setShowAddForm(false);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // Update order status
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusHistory: [
                ...order.statusHistory,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                }
              ]
            }
          : order
      )
    );
    
    toast.success(`Order #${orderId} updated to: ${newStatus.replace('_', ' ')}`);
  };

  // Calculate dashboard metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalProducts = products.length;

  if (user?.role !== 'seller') {
    return null;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your products and orders</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalOrders}</div>
                <ShoppingCart className="h-6 w-6 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</div>
                <DollarSign className="h-6 w-6 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <Package className="h-6 w-6 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalProducts}</div>
                <Package className="h-6 w-6 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            {activeTab === 'products' && (
              <Button 
                className="bg-brand-primary hover:bg-brand-dark"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : 'Add New Product'}
              </Button>
            )}
          </div>
          
          {/* Products Tab */}
          <TabsContent value="products">
            {showAddForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Fill in the details to add a new product</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddNewProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Product Title</Label>
                        <Input id="title" placeholder="Enter product title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select 
                          id="category" 
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          required
                        >
                          <option value="">Select a category</option>
                          {mockCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Regular Price (৳)</Label>
                        <Input id="price" type="number" placeholder="0.00" min="0" step="0.01" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountPrice">Sale Price (Optional)</Label>
                        <Input id="discountPrice" type="number" placeholder="0.00" min="0" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input id="stock" type="number" placeholder="0" min="0" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountEnds">Sale End Date (Optional)</Label>
                        <Input id="discountEnds" type="date" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Product Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Enter product description" 
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Product Images</Label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Drag and drop images here or click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">Max 5 images, JPG or PNG, max 2MB each</p>
                          <Button type="button" variant="outline" size="sm" className="mt-4">
                            Select Files
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-brand-primary hover:bg-brand-dark">
                        Add Product
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Products</CardTitle>
                  <CardDescription>Manage your product listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 5).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded border overflow-hidden bg-gray-100">
                                <img
                                  src={product.images[0]}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="font-medium">{product.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.category?.name}</TableCell>
                          <TableCell>
                            {product.discountPrice ? (
                              <div>
                                <span className="font-medium">৳{product.discountPrice}</span>
                                <span className="text-xs text-gray-500 line-through ml-1">৳{product.price}</span>
                              </div>
                            ) : (
                              <span className="font-medium">৳{product.price}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={product.stock <= 5 ? 'text-red-600 font-medium' : ''}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 0 ? 'outline' : 'secondary'}>
                              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage your customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.user?.name}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>৳{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs text-gray-500">Update Status</DropdownMenuLabel>
                              {order.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'processing')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve & Process
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject Order
                                  </DropdownMenuItem>
                                </>
                              )}
                              {order.status === 'processing' && (
                                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}>
                                  <TruckIcon className="mr-2 h-4 w-4 text-brand-primary" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SellerDashboard;
