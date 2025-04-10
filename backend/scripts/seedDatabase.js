// scripts/seedDatabase.js
const path = require('path'); // Import path module

// Load environment variables from the 'backend' directory
const dotenvResult = require('dotenv').config({
  path: path.resolve(__dirname, '../.env') // Resolve path relative to script location
});

// Log the result of dotenv loading
if (dotenvResult.error) {
  console.error('Error loading .env file (looking in backend dir):', dotenvResult.error);
} else {
  console.log('.env file loaded successfully from backend dir. Parsed content:', dotenvResult.parsed);
}

// Log the MONGO_URI value *immediately* after loading
console.log('process.env.MONGO_URI value:', process.env.MONGO_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// REMOVE conflicting require statements here
// const User = require('../src/models/User');
// const Product = require('../src/models/Product');
// const Category = require('../src/models/Category');
// const Order = require('../src/models/Order'); 

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // Check the value again just before connecting
        console.log('Connecting with MONGO_URI:', MONGO_URI);
        if (!MONGO_URI || typeof MONGO_URI !== 'string') {
           throw new Error(`Invalid MONGO_URI: ${MONGO_URI}`);
        }
        await mongoose.connect(MONGO_URI, {
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Add the original error stack if available
        if (err.stack) console.error(err.stack);
        process.exit(1); // Exit process with failure
    }
};

const sampleCategories = [
    { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwMg&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1593030103066-079573bd206e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwMg&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Home Goods', slug: 'home-goods', image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwMg&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1549122728-f519709caa9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwMg&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Groceries', slug: 'groceries', image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwMg&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwM&ixlib=rb-4.0.3&q=80&w=400' },
    { name: 'Toys & Games', slug: 'toys-games', image: 'https://images.unsplash.com/photo-1550751827-413f8b61acd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQwM&ixlib=rb-4.0.3&q=80&w=400' },
];

const sampleUsers = [
    { name: 'Alice Buyer', email: 'alice@example.com', password: 'password123', role: 'buyer' },
    { name: 'Bob Buyer', email: 'bob@example.com', password: 'password123', role: 'buyer' },
    { name: 'Eve Buyer', email: 'eve@example.com', password: 'password123', role: 'buyer' },
    { name: 'Charlie Seller', email: 'charlie@example.com', password: 'password123', role: 'seller' },
    { name: 'Diana Seller', email: 'diana@example.com', password: 'password123', role: 'seller' },
    { name: 'Frank Seller', email: 'frank@example.com', password: 'password123', role: 'seller' },
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
];

// Function to create sample products, needs seller and category IDs
const createSampleProducts = (sellers, categories) => {
    const charlie = sellers.find(s => s.email === 'charlie@example.com');
    const diana = sellers.find(s => s.email === 'diana@example.com');
    const frank = sellers.find(s => s.email === 'frank@example.com');

    const electronics = categories.find(c => c.slug === 'electronics');
    const clothing = categories.find(c => c.slug === 'clothing');
    const homeGoods = categories.find(c => c.slug === 'home-goods');
    const books = categories.find(c => c.slug === 'books');
    const sports = categories.find(c => c.slug === 'sports-outdoors');
    const toys = categories.find(c => c.slug === 'toys-games');

    if (!charlie || !diana || !frank || !electronics || !clothing || !homeGoods || !books || !sports || !toys) {
        throw new Error('Could not find all required sellers or categories for seeding products.');
    }
    
    return [
        {
            title: 'Wireless Bluetooth Headphones',
            slug: 'wireless-bluetooth-headphones',
            description: 'Experience premium sound quality with these comfortable wireless headphones. Features include noise cancellation, 30-hour battery life, and quick charging.',
            price: 1999,
            stock: 50,
            images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944'
            ],
            videoUrl: 'https://www.example.com/videos/headphones-demo.mp4',
            category: electronics._id,
            seller: charlie._id,
        },
        {
            title: 'Smart Watch with Heart Rate Monitor',
            slug: 'smart-watch-heart-rate',
            description: 'Track your fitness goals with this advanced smartwatch. Features include heart rate monitoring, sleep tracking, and water resistance up to 50 meters.',
            price: 2499,
            stock: 30,
            images: [
            'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1'
            ],
            category: electronics._id,
            seller: charlie._id,
        },
        {
            title: 'Men\'s Casual Cotton T-shirt',
            slug: 'mens-casual-cotton-tshirt',
            description: 'Comfortable and stylish cotton t-shirt for everyday wear. Available in multiple colors and sizes.',
            price: 499,
            stock: 0,
            images: [
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
            'https://images.unsplash.com/photo-1562157873-818bc0726f68'
            ],
            category: clothing._id,
            seller: diana._id,
        },
        {
            title: 'Non-Stick Cookware Set',
            slug: 'non-stick-cookware-set',
            description: 'Complete cookware set featuring durable non-stick coating for healthier cooking with less oil. Includes pots, pans, and utensils.',
            price: 3499,
            stock: 25,
            images: [
            'https://images.unsplash.com/photo-1584255014406-2a68ea38e40c',
            'https://images.unsplash.com/photo-1588168333986-5078d3ae3976'
            ],
            videoUrl: 'https://www.example.com/videos/cookware-demo.mp4',
            category: homeGoods._id,
            seller: diana._id,
        },
        {
            title: 'Professional Basketball',
            slug: 'professional-basketball',
            description: 'Official size and weight basketball designed for indoor and outdoor play. Features superior grip and durability.',
            price: 899,
            stock: 75,
            images: [
            'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
            'https://images.unsplash.com/photo-1598346763242-7fbe5182e121'
            ],
            category: sports._id, 
            seller: diana._id,
        },
        {
            title: 'Best-selling Fiction Novel',
            slug: 'bestselling-fiction-novel',
            description: 'Award-winning novel that captures the imagination and takes readers on an incredible journey. Available in hardcover and paperback.',
            price: 399,
            stock: 200,
            images: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f'
            ],
            category: books._id,
            seller: charlie._id,
        },
        {
            title: 'Smart LED Light Bulb',
            slug: 'smart-led-bulb',
            description: 'Control your lighting with your voice or app. Dimmable and color-changing.',
            price: 1299, 
            stock: 0,
            images: ['https://picsum.photos/seed/product3/400/300'],
            category: electronics._id, 
            seller: charlie._id,
        },
        {
            title: 'Yoga Mat',
            slug: 'yoga-mat',
            description: 'High-density foam yoga mat for comfort and stability during your practice. Non-slip surface.',
            price: 1499,
            stock: 40,
            images: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQxMQ&ixlib=rb-4.0.3&q=80&w=400'],
            category: sports._id,
            seller: frank._id,
        },
        {
            title: 'Wooden Building Blocks Set',
            slug: 'wooden-building-blocks',
            description: 'Classic wooden building blocks set for kids. Encourages creativity and fine motor skills. 50 pieces.',
            price: 999,
            stock: 60,
            images: ['https://images.unsplash.com/photo-1608889335941-8819404d15b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQxMQ&ixlib=rb-4.0.3&q=80&w=400'],
            category: toys._id,
            seller: frank._id,
        },
        {
            title: 'Graphic Print Hoodie',
            slug: 'graphic-print-hoodie',
            description: 'Comfortable fleece hoodie with a unique graphic print. Perfect for casual wear.',
            price: 1599,
            stock: 25,
            images: ['https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQxMw&ixlib=rb-4.0.3&q=80&w=400'],
            category: clothing._id,
            seller: diana._id,
        },
        {
            title: 'Portable Bluetooth Speaker',
            slug: 'portable-bluetooth-speaker',
            description: 'Compact and powerful Bluetooth speaker with long battery life and waterproof design.',
            price: 2999,
            stock: 35,
            images: ['https://images.unsplash.com/photo-1589146612001-6894f4a47599?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY4MjYxNzQxMw&ixlib=rb-4.0.3&q=80&w=400'],
            category: electronics._id,
            seller: charlie._id,
        },
    ];
};

// Function to create sample orders, needs user, seller, and product IDs
const createSampleOrders = (buyers, sellers, products) => {
    const orderStatusHistory = (status, timestamp) => ({ status, timestamp });

    // Find the necessary buyers/sellers
    const alice = buyers.find(b => b.email === 'alice@example.com');
    const bob = buyers.find(b => b.email === 'bob@example.com');
    const eve = buyers.find(b => b.email === 'eve@example.com');
    const charlie = sellers.find(s => s.email === 'charlie@example.com');
    const diana = sellers.find(s => s.email === 'diana@example.com');
    const frank = sellers.find(s => s.email === 'frank@example.com');

    // Find the necessary products, throwing errors if not found
    const headphones = products.find(p => p.slug === 'wireless-bluetooth-headphones');
    const tshirt = products.find(p => p.slug === 'mens-casual-cotton-tshirt');
    const bulb = products.find(p => p.slug === 'smart-led-bulb');
    const yogaMat = products.find(p => p.slug === 'yoga-mat');
    const hoodie = products.find(p => p.slug === 'graphic-print-hoodie');

    if (!headphones || !tshirt || !bulb || !yogaMat || !hoodie || !alice || !bob || !eve || !charlie || !diana || !frank) {
        throw new Error('Could not find all required users or products for seeding orders.');
    }

    return [
        // Order 1: Alice buys headphones from Charlie
        {
            buyer: alice._id,
            seller: charlie._id,
            product: headphones._id, 
            quantity: 1,
            totalPrice: headphones.price, 
            paymentMethod: 'Bkash', 
            currentStatus: 'Processing',
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), 
                orderStatusHistory('Processing', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), 
            ],
            shippingAddress: { street: '123 Buyer St', city: 'Buyerville', postalCode: '12345', country: 'PurchaseLand' },
        },
        // Order 2: Bob buys T-shirt from Diana
        {
            buyer: bob._id,
            seller: diana._id,
            product: tshirt._id,
            quantity: 2,
            totalPrice: tshirt.price * 2,
            paymentMethod: 'Cash on Delivery', 
            currentStatus: 'Completed', 
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
                orderStatusHistory('Processing', new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
                orderStatusHistory('Out for Delivery', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
                orderStatusHistory('Completed', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
            ],
            shippingAddress: { street: '456 Customer Ave', city: 'Client City', postalCode: '67890', country: 'OrderNation' },
        },
         // Order 3: Alice buys light bulb from Charlie
        {
            buyer: alice._id,
            seller: charlie._id,
            product: bulb._id,
            quantity: 3,
            totalPrice: bulb.price * 3,
            paymentMethod: 'Bkash', 
            currentStatus: 'Pending Approval',
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 1 * 60 * 60 * 1000)), 
            ],
            shippingAddress: { street: '123 Buyer St', city: 'Buyerville', postalCode: '12345', country: 'PurchaseLand' },
        },
        // Order 4: Eve buys Yoga Mat from Frank
        {
            buyer: eve._id,
            seller: frank._id,
            product: yogaMat._id,
            quantity: 1,
            totalPrice: yogaMat.price,
            paymentMethod: 'Cash on Delivery',
            currentStatus: 'Out for Delivery',
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
                orderStatusHistory('Processing', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
                orderStatusHistory('Out for Delivery', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
            ],
            shippingAddress: { street: '789 New St', city: 'Orderton', postalCode: '11223', country: 'ShippingLand' },
        },
        // Order 5: Bob buys Hoodie from Diana
        {
            buyer: bob._id,
            seller: diana._id,
            product: hoodie._id,
            quantity: 1,
            totalPrice: hoodie.price,
            paymentMethod: 'Bkash',
            currentStatus: 'Cancelled',
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 2 * 60 * 60 * 1000)), 
                orderStatusHistory('Cancelled', new Date(Date.now() - 1 * 60 * 60 * 1000)),
            ],
            shippingAddress: { street: '456 Customer Ave', city: 'Client City', postalCode: '67890', country: 'OrderNation' },
        },
    ];
};

// Import the enum if not already done (assuming it's exported from Order.ts)
// This might require adjusting the dynamic import logic if OrderStatus is not part of the default export
// **OR** hardcode the strings matching the enum values

// Option 1: Hardcode strings matching the Enum (Simpler for seeder)
const orderStatusHistory = (status, timestamp) => ({ status, timestamp });

const seedDatabase = async () => {
    let User, Product, Category, Order; // Define variables outside try block
    try {
        // Dynamically import models from the compiled 'dist' directory
        console.log('Importing models from dist/...');
        // Access the nested .default property
        User = (await import('../dist/models/User.js')).default.default;
        Product = (await import('../dist/models/Product.js')).default.default;
        const categoryModule = await import('../dist/models/Category.js');
        Category = categoryModule.default.default; // Access nested default
        Order = (await import('../dist/models/Order.js')).default.default; 
        console.log('Models imported.');

        // Log the imported Category module and its default export
        console.log('Imported Category Module:', categoryModule); // Keep this log for now
        console.log('Assigned Category Variable:', Category);
        console.log('Type of Category Variable:', typeof Category);
        // Check specifically if deleteMany exists
        if (Category && typeof Category.deleteMany === 'function') {
            console.log('Category.deleteMany function exists.');
        } else {
            // This error should hopefully not trigger now
            console.error('Category.deleteMany function DOES NOT exist even after nested access.'); 
        }

        // Connect to DB
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        // Keep check before calling, just in case
        if (Category && typeof Category.deleteMany === 'function') {
            await Category.deleteMany({});
        } else {
            throw new Error('Cannot clear Categories: deleteMany not found on imported Category module.');
        }
         if (User && typeof User.deleteMany === 'function') { // Add check for User
            await User.deleteMany({});
        } else {
             throw new Error('Cannot clear Users: deleteMany not found on imported User module.');
        }
         if (Product && typeof Product.deleteMany === 'function') { // Add check for Product
            await Product.deleteMany({});
        } else {
             throw new Error('Cannot clear Products: deleteMany not found on imported Product module.');
        }
        if (Order && typeof Order.deleteMany === 'function') { // Add check for Order
             await Order.deleteMany({});
        } else {
             throw new Error('Cannot clear Orders: deleteMany not found on imported Order module.');
        }
        console.log('Data cleared.');

        // Insert Categories
        console.log('Inserting categories...');
        const insertedCategories = await Category.insertMany(sampleCategories);
        console.log(`${insertedCategories.length} categories inserted.`);

        // Insert Users (hash passwords)
        console.log('Inserting users (hashing passwords)...');
        const usersToInsert = await Promise.all(sampleUsers.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { ...user, password: hashedPassword };
        }));
        const insertedUsers = await User.insertMany(usersToInsert);
        console.log(`${insertedUsers.length} users inserted.`);

        const buyers = insertedUsers.filter(u => u.role === 'buyer');
        const sellers = insertedUsers.filter(u => u.role === 'seller');

        // Insert Products
        if (sellers.length > 0 && insertedCategories.length > 0) {
             console.log('Creating and inserting products...');
            const productsToInsert = createSampleProducts(sellers, insertedCategories);
            const insertedProducts = await Product.insertMany(productsToInsert);
            console.log(`${insertedProducts.length} products inserted.`);
            
            // --- DEBUGGING: Log the actual content of insertedProducts --- 
            console.log("--- Content of insertedProducts after Product.insertMany ---");
            console.log(JSON.stringify(insertedProducts.map(p => ({_id: p._id, title: p.title, slug: p.slug, price: p.price})), null, 2));
            // --- END DEBUGGING ---

             // Insert Orders
            if (buyers.length > 0 && insertedProducts.length > 0) {
                 console.log('Creating and inserting orders...');
                 const ordersToInsert = createSampleOrders(buyers, sellers, insertedProducts);
                 const insertedOrders = await Order.insertMany(ordersToInsert);
                 console.log(`${insertedOrders.length} orders inserted.`);
            } else {
                console.log('Skipping order insertion (no buyers or products).');
            }
        } else {
            console.log('Skipping product and order insertion (no sellers or categories).');
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            console.error("Hint: Did you run 'npm run build' or 'npx tsc' in the backend directory first to compile TypeScript to the 'dist' folder?");
        }
         // Ensure models are loaded before trying to access them in error handling if needed
        if (User) console.log('User model loaded:', !!User);
        // Add similar checks for other models if error handling depends on them
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

// Run the seeder
seedDatabase();
