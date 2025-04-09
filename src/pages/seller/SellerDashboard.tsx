import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockCategories } from '@/data/mockData';
import { Product as FrontendProduct, Order as FrontendOrder, OrderStatus as FrontendStatus, Category, User as FrontendUser } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Backend Type Definitions (reuse/adapt from previous steps)
interface BackendProduct {
    _id: string; title: string; slug: string; description: string; price: number;
    discountPrice?: number; discountEnds?: string; images: string[]; videoUrl?: string;
    category: string | { _id: string; name: string; slug: string }; // Can be ID or populated
    seller: { _id: string; name: string; email: string; };
    rating?: number; stock: number; createdAt: string; updatedAt: string;
}
interface BackendOrderItem {
    _id: string;
    buyer: { _id: string; name: string; email: string }; // Populated buyer
    seller: { _id: string; name: string; email: string }; // Populated seller
    product: { _id: string; title: string; price: number; images: string[]; /* other fields if populated */ }; // Populated product
    quantity: number;
    totalPrice: number;
    paymentMethod: string;
    currentStatus: string; // Backend status enum values (e.g., 'Pending Approval')
    statusHistory: {
        status: string; // Backend status enum value
        timestamp: string;
        updatedBy?: { _id: string }; // Optional populated updatedBy ID
    }[];
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    createdAt: string;
    updatedAt: string;
}
interface BackendCategory { _id: string; name: string; slug: string; }

// Mapping functions (reuse/adapt)
const mapBackendProductToFrontend = (bp: BackendProduct): FrontendProduct => ({
    id: bp._id,
    title: bp.title,
    slug: bp.slug,
    description: bp.description,
    price: bp.price,
    discountPrice: bp.discountPrice,
    discountEnds: bp.discountEnds,
    images: bp.images,
    videoUrl: bp.videoUrl,
    categoryId: typeof bp.category === 'object' ? bp.category._id : bp.category,
    // Category object mapping might be simplified here if not populated
    category: typeof bp.category === 'object' ? { id: bp.category._id, name: bp.category.name, slug: bp.category.slug } : undefined,
    sellerId: bp.seller?._id,
    seller: bp.seller ? { id: bp.seller._id, name: bp.seller.name, email: bp.seller.email, role: 'seller', createdAt: bp.createdAt } : undefined,
    rating: bp.rating,
    stock: bp.stock,
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt,
});

const mapBackendStatusToFrontend = (backendStatus: string): FrontendStatus => {
    switch (backendStatus) {
        case 'Pending Approval': return 'pending';
        case 'Processing': return 'processing';
        case 'Out for Delivery': return 'out_for_delivery';
        case 'Completed': return 'completed';
        case 'Cancelled':
        case 'Rejected': return 'cancelled';
        default: return 'pending';
    }
};

const mapBackendOrderToFrontend = (bo: BackendOrderItem): FrontendOrder => {
     const orderItem = {
        id: bo.product._id, 
        productId: bo.product._id,
        product: {
            id: bo.product._id,
            title: bo.product.title,
            price: bo.product.price,
            images: bo.product.images,
            slug: bo.product._id, 
            description: '', 
            categoryId: '', 
            sellerId: bo.seller._id,
            stock: 1, 
            createdAt: bo.createdAt,
            updatedAt: bo.updatedAt,
        } as FrontendProduct, 
        quantity: bo.quantity,
        price: bo.totalPrice / bo.quantity, 
    };

    return {
        id: bo._id,
        userId: bo.buyer._id,
        user: { 
            id: bo.buyer._id,
            name: bo.buyer.name,
            email: bo.buyer.email,
            role: 'buyer',
            createdAt: '' 
        } as FrontendUser,
        items: [orderItem], 
        totalAmount: bo.totalPrice,
        status: mapBackendStatusToFrontend(bo.currentStatus),
        shippingAddress: {
            streetAddress: bo.shippingAddress.street,
            city: bo.shippingAddress.city,
            zipCode: bo.shippingAddress.postalCode,
            state: bo.shippingAddress.country, 
            fullName: bo.buyer.name, 
            phoneNumber: '', 
        },
        paymentMethod: bo.paymentMethod,
        paymentStatus: bo.currentStatus === 'Completed' ? 'completed' : 'pending', 
        createdAt: bo.createdAt,
        updatedAt: bo.updatedAt,
        statusHistory: bo.statusHistory.map(h => ({
            status: mapBackendStatusToFrontend(h.status),
            timestamp: h.timestamp,
            note: '' 
        })),
    };
};

// Helper to map FrontendStatus back to Backend status string
const mapFrontendStatusToBackend = (frontendStatus: FrontendStatus): string => {
     switch (frontendStatus) {
        case 'pending': return 'Pending Approval'; // Or decide if sellers can set this
        case 'processing': return 'Processing';
        case 'out_for_delivery': return 'Out for Delivery';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled'; // Or handle 'Rejected' specifically if needed
        default:
            console.warn(`Unknown frontend status to map: ${frontendStatus}`);
            return 'Processing'; // Default fallback for safety
    }
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  const [showAddForm, setShowAddForm] = useState(false);

  // --- Add Product Form State ---
  const [newProductData, setNewProductData] = useState({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '', // Store category ID
      images: '', // Comma-separated URLs for now
  });

  // --- Edit Product State ---
  const [editingProduct, setEditingProduct] = useState<FrontendProduct | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProductData, setEditProductData] = useState({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      images: '', // Comma-separated URLs
  });

  // **NEW** Delete Product State
  const [productToDelete, setProductToDelete] = useState<FrontendProduct | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auth check (remains same)
  React.useEffect(() => {
    if (user?.role !== 'seller') {
      navigate('/');
      toast.error("Access denied. Seller rights required.");
    }
  }, [user, navigate]);

  // Fetch Seller's Products
  const { 
      data: backendProducts, 
      isLoading: isLoadingProducts, 
      isError: isErrorProducts, 
      error: errorProducts 
  } = useQuery<BackendProduct[], Error>({
      queryKey: ['sellerProducts', user?.id], 
      queryFn: async () => {
          if (!user?.id) throw new Error('User ID not available');
          const response = await apiClient.get('/api/products', { params: { sellerId: user.id } });
          return response.data;
      },
      enabled: !!user?.id && user.role === 'seller', // Only run if user is a seller
  });

  // Map products
  const products = useMemo(() => 
      backendProducts ? backendProducts.map(mapBackendProductToFrontend) : [], 
      [backendProducts]
  );

  // Fetch Seller's Orders
  const { 
      data: backendOrders, 
      isLoading: isLoadingOrders, 
      isError: isErrorOrders, 
      error: errorOrders 
  } = useQuery<BackendOrderItem[], Error>({
      queryKey: ['sellerOrders', user?.id], 
      queryFn: async () => {
          const response = await apiClient.get('/api/orders/sellerorders');
          if (!Array.isArray(response.data)) {
              throw new Error('Invalid data format received for seller orders');
          }
          return response.data;
      },
      enabled: !!user?.id && user.role === 'seller', // Only run if user is a seller
      staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });

  // Map orders
  const orders = useMemo(() => 
      backendOrders ? backendOrders.map(mapBackendOrderToFrontend) : [], 
      [backendOrders]
  );

  // Fetch Categories for Add Product Form
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = 
    useQuery<BackendCategory[], Error>({
      queryKey: ['categories'],
      queryFn: async () => {
          const response = await apiClient.get('/api/categories');
          return response.data;
      },
      staleTime: 5 * 60 * 1000, // Cache categories for 5 minutes
  });

  // Mutation to update Order Status
  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } = useMutation<any, Error, { orderId: string; status: FrontendStatus }>({
      mutationFn: async ({ orderId, status }) => {
          const backendStatus = mapFrontendStatusToBackend(status);
          const response = await apiClient.put(`/api/orders/${orderId}/status`, { status: backendStatus });
          return response.data;
      },
      onSuccess: (data, variables) => {
          toast.success(`Order #${variables.orderId.substring(0,8)} status updated to ${variables.status.replace('_', ' ')}`);
          queryClient.invalidateQueries({ queryKey: ['sellerOrders', user?.id] });
      },
      onError: (error: any, variables) => {
          console.error("Update order status error:", error);
          toast.error(error.response?.data?.message || `Failed to update status for order #${variables.orderId.substring(0,8)}`);
      }
  });

  // Mutation to Add New Product
  const { mutate: addProduct, isPending: isAddingProduct } = useMutation<BackendProduct, Error, Omit<typeof newProductData, 'images' | 'price' | 'stock'> & { price: number; stock: number; images: string[] }>({
      mutationFn: async (productData) => {
          const response = await apiClient.post('/api/products', productData);
          return response.data;
      },
      onSuccess: (newProd) => {
          toast.success(`Product "${newProd.title}" added successfully!`);
          queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
          setShowAddForm(false); // Hide form on success
          // Reset form state
          setNewProductData({ title: '', description: '', price: '', stock: '', category: '', images: '' });
      },
      onError: (error: any) => {
          console.error("Add product error:", error);
          toast.error(error.response?.data?.message || "Failed to add product.");
      }
  });

  // **NEW** Mutation to Edit Product
  const { mutate: editProduct, isPending: isEditingProduct } = useMutation<BackendProduct, Error, { productId: string; productData: Omit<typeof editProductData, 'images' | 'price' | 'stock'> & { price: number; stock: number; images: string[] } }>({
      mutationFn: async ({ productId, productData }) => {
          const response = await apiClient.put(`/api/products/${productId}`, productData);
          return response.data;
      },
      onSuccess: (updatedProd) => {
          toast.success(`Product "${updatedProd.title}" updated successfully!`);
          queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
          setShowEditDialog(false); // Close dialog on success
          setEditingProduct(null);
      },
      onError: (error: any, variables) => {
          console.error("Edit product error:", error);
          toast.error(error.response?.data?.message || `Failed to update product "${variables.productData.title}".`);
      }
  });

  // **NEW** Mutation to Delete Product
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useMutation<void, Error, string>({ // Takes productId as input
      mutationFn: async (productId) => {
          await apiClient.delete(`/api/products/${productId}`);
      },
      onSuccess: (_, productId) => {
          toast.success(`Product deleted successfully.`);
          queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
          // Could also optimistically remove from cache
          // queryClient.setQueryData(['sellerProducts', user?.id], (oldData: BackendProduct[] | undefined) => 
          //      oldData?.filter(p => p._id !== productId) ?? []
          // );
          setShowDeleteConfirm(false); // Close confirmation dialog
          setProductToDelete(null);
      },
      onError: (error: any, productId) => {
          console.error("Delete product error:", error);
          // Find product title for better error message if possible (might need adjustment)
          const productTitle = products.find(p => p.id === productId)?.title || `ID: ${productId.substring(0, 8)}...`;
          toast.error(error.response?.data?.message || `Failed to delete product "${productTitle}".`);
          setShowDeleteConfirm(false); // Still close dialog on error
          setProductToDelete(null);
      }
  });

  // --- Handlers ---

  // Handle input changes for the add product form
  const handleNewProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewProductData(prev => ({ ...prev, [name]: value }));
  };
  // Specific handler for ShadCN Select component
  const handleCategoryChange = (value: string) => {
    setNewProductData(prev => ({ ...prev, category: value }));
  };

  // Handle Add New Product Form Submission
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingProduct) return;

    const priceNum = parseFloat(newProductData.price);
    const stockNum = parseInt(newProductData.stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please enter a valid positive price.");
        return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
        toast.error("Please enter a valid non-negative stock quantity.");
        return;
    }
    if (!newProductData.category) {
        toast.error("Please select a category.");
        return;
    }
    if (!newProductData.title.trim()) {
        toast.error("Please enter a product title.");
        return;
    }
     if (!newProductData.description.trim()) {
        toast.error("Please enter a product description.");
        return;
    }

    // Basic image URL validation (comma-separated)
    const imageUrls = newProductData.images.split(',') 
      .map(url => url.trim()) 
      .filter(url => url.length > 0); 
    
    if (imageUrls.length === 0) {
        toast.error("Please provide at least one image URL.");
        return;
    } 

    addProduct({ 
        title: newProductData.title.trim(),
        description: newProductData.description.trim(),
        price: priceNum,
        stock: stockNum,
        category: newProductData.category, // Send category ID
        images: imageUrls, 
    });
  };

  // **NEW** Handle input changes for the edit product form
  const handleEditProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditProductData(prev => ({ ...prev, [name]: value }));
  };
  // **NEW** Handle category change for edit product form
  const handleEditCategoryChange = (value: string) => {
    setEditProductData(prev => ({ ...prev, category: value }));
  };

  // **NEW** Handle opening the Edit Product Dialog
  const handleOpenEditDialog = (product: FrontendProduct) => {
      setEditingProduct(product);
      setEditProductData({
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock.toString(),
          category: product.categoryId || '', // Use categoryId
          images: product.images.join(', '), // Join array into comma-separated string
      });
      setShowEditDialog(true);
  };

   // **NEW** Handle Edit Product Form Submission
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isEditingProduct) return;

    const priceNum = parseFloat(editProductData.price);
    const stockNum = parseInt(editProductData.stock, 10);

    // --- Basic Validation (similar to add form) ---
    if (isNaN(priceNum) || priceNum <= 0) {
        toast.error("Please enter a valid positive price.");
        return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
        toast.error("Please enter a valid non-negative stock quantity.");
        return;
    }
     if (!editProductData.category) {
        toast.error("Please select a category.");
        return;
    }
    if (!editProductData.title.trim()) {
        toast.error("Please enter a product title.");
        return;
    }
     if (!editProductData.description.trim()) {
        toast.error("Please enter a product description.");
        return;
    }
    const imageUrls = editProductData.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    if (imageUrls.length === 0) {
        toast.error("Please provide at least one image URL.");
        return;
    }
    // --- End Validation ---

    editProduct({
        productId: editingProduct.id,
        productData: {
            title: editProductData.title.trim(),
            description: editProductData.description.trim(),
            price: priceNum,
            stock: stockNum,
            category: editProductData.category,
            images: imageUrls,
        }
    });
  };

  // **NEW** Handle opening the Delete Confirmation Dialog
  const handleOpenDeleteConfirm = (product: FrontendProduct) => {
      setProductToDelete(product);
      setShowDeleteConfirm(true);
  };

  // **NEW** Handle confirming the deletion
  const handleDeleteProductConfirm = () => {
      if (!productToDelete || isDeletingProduct) return;
      deleteProduct(productToDelete.id);
  };

  // Handle Order Status Update Click
  const handleUpdateOrderStatusClick = (orderId: string, newStatus: FrontendStatus) => {
      if (isUpdatingStatus) return;
      updateOrderStatus({ orderId, status: newStatus });
  };

  // Calculate dashboard metrics (using fetched data lengths)
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const totalProducts = products.length;

  if (user?.role !== 'seller') {
    return null;
  }

  // --- RENDER LOGIC --- 
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header and Summary Cards (use calculated metrics) */}
        {/* ... (Header JSX) ... */}
         {/* ... (Summary Cards JSX) ... */}

        {/* Main Content Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
           {/* ... (TabsList and Add Product Button) ... */}
          
          {/* Products Tab Content */}
          <TabsContent value="products">
            {/* Add Product Form (conditionally rendered) */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                        <CardDescription>Fill in the details for your new product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Form using ShadCN components */} 
                        <form onSubmit={handleAddNewProductSubmit} className="space-y-4">
                             {/* Title Input */}
                             <div>
                                <Label htmlFor="title">Product Title</Label>
                                <Input 
                                    id="title" 
                                    name="title" 
                                    value={newProductData.title}
                                    onChange={handleNewProductInputChange}
                                    placeholder="e.g. Premium Cotton T-Shirt"
                                    required 
                                    disabled={isAddingProduct}
                                />
                            </div>
                            
                            {/* Description Textarea */}
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    name="description" 
                                    value={newProductData.description}
                                    onChange={handleNewProductInputChange}
                                    placeholder="Detailed description of the product..."
                                    required 
                                    disabled={isAddingProduct}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Price Input */} 
                                <div>
                                    <Label htmlFor="price">Price (BDT)</Label>
                                    <Input 
                                        id="price" 
                                        name="price" 
                                        type="number" 
                                        value={newProductData.price}
                                        onChange={handleNewProductInputChange}
                                        placeholder="e.g. 999"
                                        required 
                                        min="0"
                                        step="0.01"
                                        disabled={isAddingProduct}
                                    />
                                </div>
                                
                                {/* Stock Input */} 
                                <div>
                                    <Label htmlFor="stock">Stock Quantity</Label>
                                    <Input 
                                        id="stock" 
                                        name="stock" 
                                        type="number" 
                                        value={newProductData.stock}
                                        onChange={handleNewProductInputChange}
                                        placeholder="e.g. 50"
                                        required 
                                        min="0"
                                        step="1"
                                        disabled={isAddingProduct}
                                    />
                                </div>

                                {/* Category Select */} 
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select 
                                        name="category" 
                                        value={newProductData.category}
                                        onValueChange={handleCategoryChange} // Use specific handler
                                        required
                                        disabled={isLoadingCategories || isAddingProduct}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder={isLoadingCategories ? "Loading..." : isErrorCategories ? "Error loading" : "Select a category"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((cat) => (
                                                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isErrorCategories && <p className="text-xs text-red-600 mt-1">Could not load categories.</p>}
                                </div>
                            </div>

                             {/* Image URLs Input */} 
                            <div>
                                <Label htmlFor="images">Image URLs</Label>
                                <Input 
                                    id="images" 
                                    name="images" 
                                    value={newProductData.images}
                                    onChange={handleNewProductInputChange}
                                    placeholder="Enter comma-separated image URLs"
                                    required 
                                    disabled={isAddingProduct}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Separate multiple URLs with a comma (,). First URL will be the main image.</p>
                            </div>

                            {/* Submit/Cancel Buttons */}
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)} disabled={isAddingProduct}>Cancel</Button>
                                <Button type="submit" disabled={isAddingProduct || isLoadingCategories}>
                                    {isAddingProduct ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Product'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Product Table */} 
            <Card className={showAddForm ? 'mt-6' : ''}>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your listed products.</CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingProducts ? (
                     <p>Loading products...</p>
                 ) : isErrorProducts ? (
                     <p className="text-red-600">Error loading products: {errorProducts?.message}</p>
                 ) : products.length === 0 ? (
                     <p>You haven't added any products yet.</p>
                 ) : (
                     <Table>
                       <TableHeader> {/* ... (Table Headings) ... */} </TableHeader>
                       <TableBody>
                           {products.map((product) => (
                               <TableRow key={product.id}>
                                   {/* ... (Table Cells: Image, Title, Price, Stock, Status, Actions) ... */}
                                    <TableCell>
                                       {/* Image */}
                                       <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded" />
                                   </TableCell>
                                   <TableCell>{product.title}</TableCell>
                                   <TableCell>৳{product.discountPrice || product.price}</TableCell>
                                   <TableCell>{product.stock}</TableCell>
                                   <TableCell><Badge variant={product.stock > 0 ? 'outline' : 'secondary'}>{product.stock > 0 ? 'Active' : 'Inactive'}</Badge></TableCell>
                                   <TableCell>
                                       {/* Actions Dropdown */} 
                                        <DropdownMenu>
                                           <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                           <DropdownMenuContent align="end">
                                               <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                               <DropdownMenuItem onClick={() => navigate(`/product/${product.slug}`)}><Eye className="mr-2 h-4 w-4"/> View</DropdownMenuItem>
                                               <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem> 
                                               <DropdownMenuSeparator />
                                               <DropdownMenuItem 
                                                  onClick={() => handleOpenDeleteConfirm(product)} 
                                                  className="text-red-600" 
                                                  disabled={isDeletingProduct} // Disable if a delete is already in progress
                                                >
                                                   <Trash2 className="mr-2 h-4 w-4"/> Delete
                                               </DropdownMenuItem>
                                           </DropdownMenuContent>
                                       </DropdownMenu>
                                   </TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                     </Table>
                 )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab Content */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Manage orders for your products.</CardDescription>
              </CardHeader>
              <CardContent>
                  {isLoadingOrders ? (
                     <div className="flex justify-center items-center py-10"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading orders...</div>
                 ) : isErrorOrders ? (
                     <p className="text-red-600 text-center py-10">Error loading orders: {errorOrders?.message}</p>
                 ) : orders.length === 0 ? (
                     <p className="text-center py-10">No orders found for your products yet.</p>
                 ) : (
                     <Table>
                       <TableHeader>
                            <TableRow>
                               <TableHead>Order ID</TableHead>
                               <TableHead>Date</TableHead>
                               <TableHead>Customer</TableHead>
                               <TableHead>Items</TableHead>
                               <TableHead>Total</TableHead>
                               <TableHead>Status</TableHead>
                               <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {orders.map((order) => (
                               <TableRow key={order.id}>
                                   <TableCell>#{order.id.substring(0, 8)}...</TableCell>
                                   <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                   <TableCell>{order.user?.name || 'N/A'}</TableCell>
                                   <TableCell>{order.items.length}</TableCell>
                                   <TableCell>৳{order.totalAmount.toLocaleString()}</TableCell>
                                   <TableCell><Badge variant={order.status === 'completed' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>{order.status.replace('_', ' ')}</Badge></TableCell>
                                   <TableCell className="text-right">
                                        <DropdownMenu>
                                           <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdatingStatus}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                           <DropdownMenuContent align="end">
                                               <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                               <DropdownMenuItem 
                                                   disabled={isUpdatingStatus || order.status === 'processing'} 
                                                   onClick={() => handleUpdateOrderStatusClick(order.id, 'processing')}
                                               >Mark as Processing</DropdownMenuItem>
                                               <DropdownMenuItem 
                                                   disabled={isUpdatingStatus || order.status === 'out_for_delivery'} 
                                                   onClick={() => handleUpdateOrderStatusClick(order.id, 'out_for_delivery')}
                                               >Mark as Out for Delivery</DropdownMenuItem>
                                               <DropdownMenuItem 
                                                   disabled={isUpdatingStatus || order.status === 'completed'} 
                                                   onClick={() => handleUpdateOrderStatusClick(order.id, 'completed')}
                                               >Mark as Completed</DropdownMenuItem>
                                               <DropdownMenuSeparator />
                                               <DropdownMenuItem 
                                                   disabled={isUpdatingStatus || order.status === 'cancelled'} 
                                                   onClick={() => handleUpdateOrderStatusClick(order.id, 'cancelled')} 
                                                   className="text-red-600"
                                               >Cancel Order</DropdownMenuItem>
                                           </DropdownMenuContent>
                                       </DropdownMenu>
                                   </TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                     </Table>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* **NEW** Edit Product Dialog */} 
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the details for "{editingProduct?.title}". Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                 {/* Form using ShadCN components for editing */}
                 <form onSubmit={handleEditProductSubmit} className="space-y-4 py-4">
                    {/* Title Input */} 
                    <div>
                        <Label htmlFor="edit-title">Product Title</Label>
                        <Input 
                            id="edit-title" 
                            name="title" 
                            value={editProductData.title}
                            onChange={handleEditProductInputChange}
                            required 
                            disabled={isEditingProduct}
                        />
                    </div>
                    
                    {/* Description Textarea */} 
                    <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea 
                            id="edit-description" 
                            name="description" 
                            value={editProductData.description}
                            onChange={handleEditProductInputChange}
                            required 
                            disabled={isEditingProduct}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Price Input */} 
                        <div>
                            <Label htmlFor="edit-price">Price (BDT)</Label>
                            <Input 
                                id="edit-price" 
                                name="price" 
                                type="number" 
                                value={editProductData.price}
                                onChange={handleEditProductInputChange}
                                required 
                                min="0"
                                step="0.01"
                                disabled={isEditingProduct}
                            />
                        </div>
                        
                        {/* Stock Input */} 
                        <div>
                            <Label htmlFor="edit-stock">Stock Quantity</Label>
                            <Input 
                                id="edit-stock" 
                                name="stock" 
                                type="number" 
                                value={editProductData.stock}
                                onChange={handleEditProductInputChange}
                                required 
                                min="0"
                                step="1"
                                disabled={isEditingProduct}
                            />
                        </div>

                        {/* Category Select */} 
                        <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Select 
                                name="category" 
                                value={editProductData.category}
                                onValueChange={handleEditCategoryChange} // Use edit handler
                                required
                                disabled={isLoadingCategories || isEditingProduct}
                            >
                                <SelectTrigger id="edit-category">
                                    <SelectValue placeholder={isLoadingCategories ? "Loading..." : isErrorCategories ? "Error loading" : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             {isErrorCategories && <p className="text-xs text-red-600 mt-1">Could not load categories.</p>}
                        </div>
                    </div>

                    {/* Image URLs Input */} 
                    <div>
                        <Label htmlFor="edit-images">Image URLs</Label>
                        <Input 
                            id="edit-images" 
                            name="images" 
                            value={editProductData.images}
                            onChange={handleEditProductInputChange}
                            placeholder="Enter comma-separated image URLs"
                            required 
                            disabled={isEditingProduct}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Separate multiple URLs with a comma (,). First URL is main image.</p>
                    </div>
                    
                    {/* Form submission is handled by the footer button */}
                 </form>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isEditingProduct}>Cancel</Button>
                    </DialogClose>
                    {/* Attach submit handler to the save button's onClick */} 
                    <Button type="button" onClick={handleEditProductSubmit} disabled={isEditingProduct || isLoadingCategories}>
                        {isEditingProduct ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </Button>
                </DialogFooter>
             </DialogContent>
        </Dialog>

        {/* **NEW** Delete Product Confirmation Dialog */} 
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product 
                <span className="font-semibold"> "{productToDelete?.title}"</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingProduct}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProductConfirm} disabled={isDeletingProduct} className="bg-red-600 hover:bg-red-700">
                  {isDeletingProduct ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Yes, delete product'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </PageLayout>
  );
};

export default SellerDashboard;
