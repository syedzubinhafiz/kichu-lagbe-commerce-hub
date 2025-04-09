// scripts/seedDatabase.js
// Load environment variables from the current working directory
const dotenvResult = require('dotenv').config();

// Log the result of dotenv loading
if (dotenvResult.error) {
  console.error('Error loading .env file (looking in CWD):', dotenvResult.error);
} else {
  console.log('.env file loaded successfully from CWD. Parsed content:', dotenvResult.parsed);
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
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Home Goods', slug: 'home-goods' },
    { name: 'Books', slug: 'books' },
    { name: 'Groceries', slug: 'groceries' },
];

const sampleUsers = [
    { name: 'Alice Buyer', email: 'alice@example.com', password: 'password123', role: 'buyer' },
    { name: 'Bob Buyer', email: 'bob@example.com', password: 'password123', role: 'buyer' },
    { name: 'Charlie Seller', email: 'charlie@example.com', password: 'password123', role: 'seller' },
    { name: 'Diana Seller', email: 'diana@example.com', password: 'password123', role: 'seller' },
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
];

// Function to create sample products, needs seller and category IDs
const createSampleProducts = (sellers, categories) => [
    {
        title: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-headphones',
        description: 'Immersive sound experience with adaptive noise cancellation. Long battery life.',
        price: 14999, stock: 50, images: ['https://picsum.photos/seed/product1/400/300', 'https://picsum.photos/seed/product1a/400/300'],
        category: categories.find(c => c.slug === 'electronics')._id, seller: sellers.find(s => s.email === 'charlie@example.com')._id,
    },
    {
        title: 'Organic Cotton T-Shirt', slug: 'organic-cotton-tshirt',
        description: 'Soft and breathable 100% organic cotton t-shirt. Available in various colors.',
        price: 1999, stock: 150, images: ['https://picsum.photos/seed/product2/400/300'],
        category: categories.find(c => c.slug === 'clothing')._id, seller: sellers.find(s => s.email === 'diana@example.com')._id,
    },
    {
        title: 'Smart LED Light Bulb', slug: 'smart-led-bulb',
        description: 'Control your lighting with your voice or app. Dimmable and color-changing.',
        price: 1299, stock: 80, images: ['https://picsum.photos/seed/product3/400/300'],
        category: categories.find(c => c.slug === 'electronics')._id, seller: sellers.find(s => s.email === 'charlie@example.com')._id,
    },
    {
        title: 'Stainless Steel Water Bottle', slug: 'stainless-steel-bottle',
        description: 'Durable and eco-friendly water bottle. Keeps drinks cold or hot for hours.',
        price: 1599, stock: 200, images: ['https://picsum.photos/seed/product4/400/300'],
        category: categories.find(c => c.slug === 'home-goods')._id, seller: sellers.find(s => s.email === 'diana@example.com')._id,
    },
      {
        title: 'Laptop Backpack', slug: 'laptop-backpack',
        description: 'Comfortable backpack with padded laptop compartment and multiple pockets.',
        price: 3499, stock: 30, images: ['https://picsum.photos/seed/product5/400/300'],
        category: categories.find(c => c.slug === 'electronics')._id, seller: sellers.find(s => s.email === 'charlie@example.com')._id,
    },
    {
        title: 'Running Shoes', slug: 'running-shoes',
        description: 'Lightweight and cushioned running shoes for optimal performance.',
        price: 4999, stock: 60, images: ['https://picsum.photos/seed/product6/400/300'],
        category: categories.find(c => c.slug === 'clothing')._id, seller: sellers.find(s => s.email === 'diana@example.com')._id,
    },
];

// Function to create sample orders, needs user, seller, and product IDs
const createSampleOrders = (buyers, sellers, products) => {
    const orderStatusHistory = (status, timestamp) => ({ status, timestamp });

    // Find the necessary products, throwing errors if not found
    const headphones = products.find(p => p.slug === 'wireless-headphones');
    if (!headphones) throw new Error('Could not find product with slug "wireless-headphones"');

    const tshirt = products.find(p => p.slug === 'organic-cotton-tshirt');
     if (!tshirt) throw new Error('Could not find product with slug "organic-cotton-tshirt"');

    const bulb = products.find(p => p.slug === 'smart-led-bulb');
    if (!bulb) throw new Error('Could not find product with slug "smart-led-bulb"');


    return [
        // Order 1: Alice buys headphones from Charlie
        {
            buyer: buyers.find(b => b.email === 'alice@example.com')._id,
            seller: sellers.find(s => s.email === 'charlie@example.com')._id,
            product: headphones._id, 
            quantity: 1,
            totalPrice: headphones.price, 
            paymentMethod: 'Bkash', 
            currentStatus: 'Processing', // Hardcoded string
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), 
                orderStatusHistory('Processing', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), 
            ],
            shippingAddress: { street: '123 Buyer St', city: 'Buyerville', postalCode: '12345', country: 'PurchaseLand' },
        },
        // Order 2: Bob buys T-shirt from Diana
        {
            buyer: buyers.find(b => b.email === 'bob@example.com')._id,
            seller: sellers.find(s => s.email === 'diana@example.com')._id,
            product: tshirt._id,
            quantity: 2,
            totalPrice: tshirt.price * 2,
            paymentMethod: 'Cash on Delivery', 
            currentStatus: 'Completed', // Hardcoded string
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
            buyer: buyers.find(b => b.email === 'alice@example.com')._id,
            seller: sellers.find(s => s.email === 'charlie@example.com')._id,
            product: bulb._id,
            quantity: 3,
            totalPrice: bulb.price * 3,
            paymentMethod: 'Bkash', 
            currentStatus: 'Pending Approval', // Hardcoded string
            statusHistory: [
                orderStatusHistory('Pending Approval', new Date(Date.now() - 1 * 60 * 60 * 1000)), 
            ],
            shippingAddress: { street: '123 Buyer St', city: 'Buyerville', postalCode: '12345', country: 'PurchaseLand' },
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
