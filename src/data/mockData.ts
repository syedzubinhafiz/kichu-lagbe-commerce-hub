
import { Category, Product, User, Order, Review } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@kichulage.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Seller Store',
    email: 'seller@kichulage.com',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    createdAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'John Buyer',
    email: 'buyer@example.com',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
    createdAt: '2023-01-03T00:00:00Z'
  }
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9'
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'
  },
  {
    id: '4',
    name: 'Books',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
  },
  {
    id: '5',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843'
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Experience premium sound quality with these comfortable wireless headphones. Features include noise cancellation, 30-hour battery life, and quick charging.',
    price: 1999,
    discountPrice: 1699,
    discountEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944'
    ],
    videoUrl: 'https://www.example.com/videos/headphones-demo.mp4',
    categoryId: '1',
    category: {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.5,
    stock: 50,
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Smart Watch with Heart Rate Monitor',
    slug: 'smart-watch-heart-rate',
    description: 'Track your fitness goals with this advanced smartwatch. Features include heart rate monitoring, sleep tracking, and water resistance up to 50 meters.',
    price: 2499,
    discountPrice: 1999,
    discountEnds: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    images: [
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1'
    ],
    categoryId: '1',
    category: {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.2,
    stock: 30,
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Men\'s Casual Cotton T-shirt',
    slug: 'mens-casual-cotton-tshirt',
    description: 'Comfortable and stylish cotton t-shirt for everyday wear. Available in multiple colors and sizes.',
    price: 499,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68'
    ],
    categoryId: '2',
    category: {
      id: '2',
      name: 'Clothing',
      slug: 'clothing',
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.0,
    stock: 100,
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-20T00:00:00Z'
  },
  {
    id: '4',
    title: 'Non-Stick Cookware Set',
    slug: 'non-stick-cookware-set',
    description: 'Complete cookware set featuring durable non-stick coating for healthier cooking with less oil. Includes pots, pans, and utensils.',
    price: 3499,
    discountPrice: 2999,
    discountEnds: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    images: [
      'https://images.unsplash.com/photo-1584255014406-2a68ea38e40c',
      'https://images.unsplash.com/photo-1588168333986-5078d3ae3976'
    ],
    videoUrl: 'https://www.example.com/videos/cookware-demo.mp4',
    categoryId: '3',
    category: {
      id: '3',
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.7,
    stock: 25,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: '5',
    title: 'Professional Basketball',
    slug: 'professional-basketball',
    description: 'Official size and weight basketball designed for indoor and outdoor play. Features superior grip and durability.',
    price: 899,
    images: [
      'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
      'https://images.unsplash.com/photo-1598346763242-7fbe5182e121'
    ],
    categoryId: '5',
    category: {
      id: '5',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.3,
    stock: 75,
    createdAt: '2023-04-05T00:00:00Z',
    updatedAt: '2023-04-10T00:00:00Z'
  },
  {
    id: '6',
    title: 'Best-selling Fiction Novel',
    slug: 'bestselling-fiction-novel',
    description: 'Award-winning novel that captures the imagination and takes readers on an incredible journey. Available in hardcover and paperback.',
    price: 399,
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f'
    ],
    categoryId: '4',
    category: {
      id: '4',
      name: 'Books',
      slug: 'books',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.9,
    stock: 200,
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2023-03-25T00:00:00Z'
  },
  {
    id: '7',
    title: '4K Ultra HD Smart TV',
    slug: '4k-ultra-hd-smart-tv',
    description: 'Experience stunning picture quality with this 55-inch 4K smart TV. Features include HDR, voice control, and built-in streaming apps.',
    price: 29999,
    discountPrice: 26999,
    discountEnds: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
      'https://images.unsplash.com/photo-1577979749830-f1d742b96791'
    ],
    videoUrl: 'https://www.example.com/videos/tv-demo.mp4',
    categoryId: '1',
    category: {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.6,
    stock: 15,
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z'
  },
  {
    id: '8',
    title: 'Women\'s Running Shoes',
    slug: 'womens-running-shoes',
    description: 'Lightweight and comfortable running shoes with cushioned soles for maximum support. Breathable material keeps feet cool during workouts.',
    price: 1499,
    discountPrice: 1299,
    discountEnds: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5'
    ],
    categoryId: '2',
    category: {
      id: '2',
      name: 'Clothing',
      slug: 'clothing',
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9'
    },
    sellerId: '2',
    seller: mockUsers[1],
    rating: 4.4,
    stock: 60,
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-04-20T00:00:00Z'
  }
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: '1',
    userId: '3',
    user: mockUsers[2],
    productId: '1',
    rating: 5,
    comment: 'These are the best headphones I\'ve ever owned! The sound quality is amazing and the noise cancellation works perfectly.',
    createdAt: '2023-03-01T00:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    user: mockUsers[2],
    productId: '1',
    rating: 4,
    comment: 'Great headphones for the price. Battery life is impressive.',
    createdAt: '2023-03-05T00:00:00Z'
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    productId: '2',
    rating: 4,
    comment: 'The smartwatch has been very helpful for tracking my workouts. The heart rate monitor seems accurate.',
    createdAt: '2023-04-10T00:00:00Z'
  },
  {
    id: '4',
    userId: '3',
    user: mockUsers[2],
    productId: '4',
    rating: 5,
    comment: 'This cookware set is fantastic! Everything cooks evenly and cleaning is a breeze.',
    createdAt: '2023-02-20T00:00:00Z'
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '3',
    user: mockUsers[2],
    items: [
      {
        id: '1',
        productId: '1',
        product: mockProducts[0],
        quantity: 1,
        price: 1699
      },
      {
        id: '2',
        productId: '3',
        product: mockProducts[2],
        quantity: 2,
        price: 499
      }
    ],
    totalAmount: 2697,
    status: 'completed',
    shippingAddress: {
      fullName: 'John Buyer',
      streetAddress: '123 Main St',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1000',
      phoneNumber: '+8801712345678'
    },
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'completed',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-03-18T00:00:00Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-03-15T00:00:00Z'
      },
      {
        status: 'processing',
        timestamp: '2023-03-16T00:00:00Z'
      },
      {
        status: 'out_for_delivery',
        timestamp: '2023-03-17T00:00:00Z'
      },
      {
        status: 'completed',
        timestamp: '2023-03-18T00:00:00Z',
        note: 'Delivered successfully'
      }
    ]
  },
  {
    id: '2',
    userId: '3',
    user: mockUsers[2],
    items: [
      {
        id: '3',
        productId: '2',
        product: mockProducts[1],
        quantity: 1,
        price: 1999
      }
    ],
    totalAmount: 1999,
    status: 'processing',
    shippingAddress: {
      fullName: 'John Buyer',
      streetAddress: '123 Main St',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1000',
      phoneNumber: '+8801712345678'
    },
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2023-05-02T00:00:00Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-01T00:00:00Z'
      },
      {
        status: 'processing',
        timestamp: '2023-05-02T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    items: [
      {
        id: '4',
        productId: '4',
        product: mockProducts[3],
        quantity: 1,
        price: 2999
      }
    ],
    totalAmount: 2999,
    status: 'pending',
    shippingAddress: {
      fullName: 'John Buyer',
      streetAddress: '123 Main St',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1000',
      phoneNumber: '+8801712345678'
    },
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-10T00:00:00Z'
      }
    ]
  }
];

// Helper functions to simulate API calls
export const getProducts = (limit = 20, category?: string) => {
  let filteredProducts = [...mockProducts];
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category?.slug === category);
  }
  
  return filteredProducts.slice(0, limit);
};

export const getProductById = (id: string) => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug = (slug: string) => {
  return mockProducts.find(p => p.slug === slug);
};

export const getCategories = () => {
  return [...mockCategories];
};

export const getReviewsByProductId = (productId: string) => {
  return mockReviews.filter(r => r.productId === productId);
};

export const getOrdersByUserId = (userId: string) => {
  return mockOrders.filter(o => o.userId === userId);
};

export const getAllOrders = () => {
  return [...mockOrders];
};

export const getAllUsers = () => {
  return [...mockUsers];
};
