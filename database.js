// Database Configuration
const DB_NAME = 'MarketplaceDB';
const DB_VERSION = 1;

// Database Schema
const OBJECT_STORES = {
    PRODUCTS: 'products',
    USERS: 'users',
    VENDORS: 'vendors',
    ORDERS: 'orders',
    CART: 'cart'
};

// Initialize Database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create Products Store
            if (!db.objectStoreNames.contains(OBJECT_STORES.PRODUCTS)) {
                const productStore = db.createObjectStore(OBJECT_STORES.PRODUCTS, { keyPath: 'id', autoIncrement: true });
                productStore.createIndex('category', 'category', { unique: false });
                productStore.createIndex('vendor', 'vendor', { unique: false });
                productStore.createIndex('featured', 'featured', { unique: false });
            }
            
            // Create Users Store
            if (!db.objectStoreNames.contains(OBJECT_STORES.USERS)) {
                const userStore = db.createObjectStore(OBJECT_STORES.USERS, { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('email', 'email', { unique: true });
                userStore.createIndex('username', 'username', { unique: true });
            }
            
            // Create Vendors Store
            if (!db.objectStoreNames.contains(OBJECT_STORES.VENDORS)) {
                const vendorStore = db.createObjectStore(OBJECT_STORES.VENDORS, { keyPath: 'id', autoIncrement: true });
                vendorStore.createIndex('userId', 'userId', { unique: true });
                vendorStore.createIndex('storeName', 'storeName', { unique: true });
            }
            
            // Create Orders Store
            if (!db.objectStoreNames.contains(OBJECT_STORES.ORDERS)) {
                const orderStore = db.createObjectStore(OBJECT_STORES.ORDERS, { keyPath: 'id', autoIncrement: true });
                orderStore.createIndex('customerId', 'customerId', { unique: false });
                orderStore.createIndex('vendorId', 'vendorId', { unique: false });
                orderStore.createIndex('date', 'date', { unique: false });
            }
            
            // Create Cart Store
            if (!db.objectStoreNames.contains(OBJECT_STORES.CART)) {
                const cartStore = db.createObjectStore(OBJECT_STORES.CART, { keyPath: 'id', autoIncrement: true });
                cartStore.createIndex('userId', 'userId', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(`Database error: ${event.target.error}`);
        };
    });
}

// Database Operations
class DatabaseService {
    constructor() {
        this.db = null;
    }
    
    async init() {
        try {
            if (!this.db) {
                console.log('Initializing database...');
                this.db = await initDatabase();
                await this.seedDatabaseIfEmpty();
                return this.db;
            }
            return this.db;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
    
    // Seed database with mock data if empty
    async seedDatabaseIfEmpty() {
        try {
            const productCount = await this.count(OBJECT_STORES.PRODUCTS);
            const vendorCount = await this.count(OBJECT_STORES.VENDORS);
            
            // Seed vendors if empty
            if (vendorCount === 0) {
                console.log('Seeding vendors...');
                for (const vendor of mockVendors) {
                    await this.add(OBJECT_STORES.VENDORS, vendor);
                }
                console.log('Database seeded with vendor data');
            }
            
            // Seed products if empty
            if (productCount === 0) {
                console.log('Seeding products...');
                for (const product of extendedProductListings) {
                    await this.add(OBJECT_STORES.PRODUCTS, product);
                }
                console.log('Database seeded with extended product listings');
            } else {
                // If products exist but we want to add the extended listings
                const existingProducts = await this.getAll(OBJECT_STORES.PRODUCTS);
                if (existingProducts.length < extendedProductListings.length) {
                    // Add only new products that don't exist yet
                    const existingIds = existingProducts.map(p => p.id);
                    const newProducts = extendedProductListings.filter(p => !existingIds.includes(p.id));
                    
                    for (const product of newProducts) {
                        await this.add(OBJECT_STORES.PRODUCTS, product);
                    }
                    console.log(`Added ${newProducts.length} new extended product listings`);
                }
            }
        } catch (error) {
            console.error('Error seeding database:', error);
        }
    }
    
    // Generic database operations
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                // If this is the products store, ensure image paths are correct
                if (storeName === OBJECT_STORES.PRODUCTS) {
                    const products = request.result;
                    const validCategories = [
                        'Textile', 
                        'Pottery and ceramics', 
                        'Traditional Jewellery', 
                        'Organic Products', 
                        'Tribal Art', 
                        'Wood crafts'
                    ];
                    
                    // Log product paths for debugging but don't filter them out
                    products.forEach(product => {
                        if (product.image) {
                            const isValidPath = validCategories.some(category => 
                                product.image.includes(`images/${category}/`)
                            );
                            console.log(`Product ${product.id} - ${product.name}: ${product.image} - Valid path: ${isValidPath}`);
                        }
                    });
                    
                    resolve(products);
                } else {
                    resolve(request.result);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async add(storeName, item) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async update(storeName, item) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async count(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log(`Store ${storeName} cleared successfully`);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Specific operations for products
    async getProductsByCategory(category) {
        return this.getByIndex(OBJECT_STORES.PRODUCTS, 'category', category);
    }
    
    async getFeaturedProducts() {
        try {
            const allProducts = await this.getAll(OBJECT_STORES.PRODUCTS);
            // Return all products marked as featured
            const featuredProducts = allProducts.filter(product => product.featured === true);
            
            // If there are not enough featured products, add some more high-quality products
            if (featuredProducts.length < 8) {
                // Sort by rating and add top-rated products that aren't already featured
                const topRatedProducts = allProducts
                    .filter(product => !product.featured)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 8 - featuredProducts.length);
                
                return [...featuredProducts, ...topRatedProducts];
            }
            
            return featuredProducts;
        } catch (error) {
            console.error('Error getting featured products:', error);
            return [];
        }
    }
    
    async getProductsByVendor(vendorId) {
        return this.getByIndex(OBJECT_STORES.PRODUCTS, 'vendor', vendorId);
    }
    
    // User operations
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(OBJECT_STORES.USERS, 'readonly');
            const store = transaction.objectStore(OBJECT_STORES.USERS);
            const index = store.index('email');
            const request = index.get(email);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Vendor operations
    async getVendorByUserId(userId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(OBJECT_STORES.VENDORS, 'readonly');
            const store = transaction.objectStore(OBJECT_STORES.VENDORS);
            const index = store.index('userId');
            const request = index.get(userId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // Order operations
    async getOrdersByCustomer(customerId) {
        return this.getByIndex(OBJECT_STORES.ORDERS, 'customerId', customerId);
    }
    
    async getOrdersByVendor(vendorId) {
        return this.getByIndex(OBJECT_STORES.ORDERS, 'vendorId', vendorId);
    }
    
    // Cart operations
    async getCartByUser(userId) {
        return this.getByIndex(OBJECT_STORES.CART, 'userId', userId);
    }
    
    // Add new methods for vendor operations
    async getAllVendors() {
        return this.getAll(OBJECT_STORES.VENDORS);
    }
    
    async getVendorById(id) {
        return this.getById(OBJECT_STORES.VENDORS, id);
    }
    
    async getProductsByVendorId(vendorId) {
        const allProducts = await this.getAll(OBJECT_STORES.PRODUCTS);
        return allProducts.filter(product => product.vendorId === vendorId);
    }
    
    // Method to get all files in a directory
    async getAll(path) {
        // If this is a database store name, use the regular getAll method
        if (Object.values(OBJECT_STORES).includes(path)) {
            return this._getAllFromStore(path);
        }
        
        // Otherwise, try to list files in the directory
        return this._listFilesInDirectory(path);
    }
    
    // Original getAll method renamed to _getAllFromStore
    async _getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not initialized');
                return;
            }
            
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                // If this is the products store, ensure image paths are correct
                if (storeName === OBJECT_STORES.PRODUCTS) {
                    const products = request.result;
                    const validCategories = [
                        'Textile', 
                        'Pottery and ceramics', 
                        'Traditional Jewellery', 
                        'Organic Products', 
                        'Tribal Art', 
                        'Wood crafts'
                    ];
                    
                    // Log product paths for debugging but don't filter them out
                    products.forEach(product => {
                        if (product.image) {
                            const isValidPath = validCategories.some(category => 
                                product.image.includes(`images/${category}/`)
                            );
                            console.log(`Product ${product.id} - ${product.name}: ${product.image} - Valid path: ${isValidPath}`);
                        }
                    });
                    
                    resolve(products);
                } else {
                    resolve(request.result);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    // Method to list files in a directory
    async _listFilesInDirectory(directoryPath) {
        return new Promise((resolve) => {
            try {
                console.log(`Listing files in directory: ${directoryPath}`);
                
                // For this demo, we'll use a simulated approach to get image files
                // In a real application, this would be an API call to the server
                
                // First, try to get images that match this path from the products database
                this._getAllFromStore(OBJECT_STORES.PRODUCTS)
                    .then(products => {
                        // Filter products that have images in this directory
                        const matchingProducts = products.filter(product => 
                            product.image && product.image.startsWith(directoryPath)
                        );
                        
                        if (matchingProducts.length > 0) {
                            console.log(`Found ${matchingProducts.length} products with images in ${directoryPath}`);
                            
                            // Extract filenames from the image paths
                            const files = matchingProducts.map(product => {
                                const parts = product.image.split('/');
                                return { name: parts[parts.length - 1] };
                            });
                            
                            resolve(files);
                        } else {
                            console.log(`No products found with images in ${directoryPath}`);
                            resolve([]);
                        }
                    })
                    .catch(error => {
                        console.error(`Error getting products for directory ${directoryPath}:`, error);
                        resolve([]);
                    });
            } catch (error) {
                console.error(`Error listing files in directory ${directoryPath}:`, error);
                resolve([]);
            }
        });
    }
}

// Create and export database instance
const dbService = new DatabaseService();

// Make database service available globally
window.dbService = dbService;
window.OBJECT_STORES = OBJECT_STORES;

// Keep mock data for reference and initial seeding
// Mock Products (simplified subset of extended listings)
const mockProducts = [
    {
        id: 101,
        name: "Handwoven Off-White Khadi Cotton Saree",
        price: 3499,
        category: "textiles",
        image: "images/Textile/Saree_OffWhite.webp",
        featured: true
    },
    {
        id: 102,
        name: "Fancy Handloom Bed Sheet",
        price: 1899,
        category: "textiles",
        image: "images/Textile/BedSheet.png",
        featured: false
    },
    {
        id: 103,
        name: "Traditional Silk Saree",
        price: 7999,
        category: "textiles",
        image: "images/Textile/saree  .jpg",
        featured: true
    },
    {
        id: 201,
        name: "Handcrafted Ceramic Bowl Set",
        price: 1899,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_Bowl.jpg",
        featured: true
    },
    {
        id: 203,
        name: "Clay Craft Handi Pot",
        price: 1499,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_handi_pot.webp",
        featured: true
    },
    {
        id: 301,
        name: "Traditional Silver Necklace",
        price: 5999,
        category: "jewelry",
        image: "images/Traditional Jewellery/Jewellery.jpg",
        featured: true
    },
    {
        id: 303,
        name: "Traditional Bridal Jewelry Set",
        price: 12999,
        category: "jewelry",
        image: "images/Traditional Jewellery/jewellery_.jpg",
        featured: true
    },
    {
        id: 401,
        name: "Organic Ginger Powder",
        price: 299,
        category: "organic",
        image: "images/Organic Products/Ginger_Powder.webp",
        featured: true
    },
    {
        id: 403,
        name: "Organic Dates Powder",
        price: 349,
        category: "organic",
        image: "images/Organic Products/Dates_Powder.webp",
        featured: true
    },
    {
        id: 501,
        name: "Tribal Art Figurine",
        price: 1999,
        category: "tribal",
        image: "images/Tribal Art/Art_figure.jpg",
        featured: true
    },
    {
        id: 502,
        name: "Traditional Tribal Painting",
        price: 3499,
        category: "tribal",
        image: "images/Tribal Art/Art.jpg",
        featured: true
    },
    {
        id: 601,
        name: "Handcrafted Wooden Basket",
        price: 1499,
        category: "woodcraft",
        image: "images/Wood crafts/Wood_basket.jpg",
        featured: true
    },
    {
        id: 603,
        name: "Wooden Wall Clock",
        price: 1999,
        category: "woodcraft",
        image: "images/Wood crafts/wood_clock.jpg",
        featured: true
    },
    {
        id: 606,
        name: "Handcrafted Wooden Bowl Set",
        price: 1299,
        category: "woodcraft",
        image: "images/Wood crafts/wood_Bowl.jpg",
        featured: true
    }
];

// Mock Vendor Products (for dashboard)
const mockVendorProducts = [
    {
        id: 101,
        name: "Handwoven Ikat Dupatta",
        description: "Traditional Pochampally Ikat dupatta with geometric patterns handwoven by artisans from Telangana. Natural dyes and 100% cotton.",
        price: 1499,
        category: "textiles",
        image: "images/Textile/WhatsApp Image 2025-07-02 at 00.34.13_90883c32.jpg",
        stock: 25,
        active: true,
        sales: 37,
        dateAdded: "2023-04-10"
    },
    {
        id: 102,
        name: "Brass Dhokra Owl Figurine",
        description: "Traditional tribal brass figurine made using the ancient lost-wax casting technique. Each piece is unique with distinctive tribal patterns.",
        price: 999,
        category: "tribal",
        image: "images/Tribal Art/images.jpg",
        stock: 12,
        active: true,
        sales: 15,
        dateAdded: "2023-05-05"
    },
    {
        id: 103,
        name: "Warli Painting on Cloth",
        description: "Hand-painted Warli tribal art from Maharashtra on natural cotton cloth. Depicts traditional village life and rituals.",
        price: 1299,
        category: "tribal",
        image: "images/Tribal Art/hq720.jpg",
        stock: 8,
        active: true,
        sales: 22,
        dateAdded: "2023-03-20"
    },
    {
        id: 104,
        name: "Organic Turmeric Powder",
        description: "100% organic turmeric powder sourced directly from farmers in Kerala. High curcumin content and traditional processing methods.",
        price: 299,
        category: "organic",
        image: "images/Organic Products/images.jpg",
        stock: 0,
        active: false,
        sales: 42,
        dateAdded: "2023-02-15"
    }
];

// Mock Orders (for vendor dashboard)
const mockOrders = [
    {
        id: 1001,
        customer: "John Smith",
        date: "2023-06-10",
        items: [
            { id: 101, name: "Premium Coffee Beans", quantity: 2, price: 14.99 },
            { id: 102, name: "Handmade Ceramic Mug", quantity: 1, price: 19.99 }
        ],
        total: 49.97,
        status: "Delivered"
    },
    {
        id: 1002,
        customer: "Sarah Johnson",
        date: "2023-06-12",
        items: [
            { id: 103, name: "Bamboo Cutting Board", quantity: 1, price: 29.99 }
        ],
        total: 29.99,
        status: "Shipped"
    },
    {
        id: 1003,
        customer: "Michael Brown",
        date: "2023-06-15",
        items: [
            { id: 101, name: "Premium Coffee Beans", quantity: 1, price: 14.99 },
            { id: 104, name: "Organic Honey", quantity: 2, price: 12.99 }
        ],
        total: 40.97,
        status: "Processing"
    }
];

// Mock Users
const mockUsers = [
    {
        id: 1,
        name: "John Smith",
        email: "john@example.com",
        type: "customer",
        address: "123 Main St, Anytown, USA",
        orders: [1001]
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        type: "customer",
        address: "456 Oak Ave, Somewhere, USA",
        orders: [1002]
    },
    {
        id: 3,
        name: "Michael Brown",
        email: "michael@example.com",
        type: "customer",
        address: "789 Pine Rd, Nowhere, USA",
        orders: [1003]
    },
    {
        id: 4,
        name: "Artisan Goods Co.",
        email: "vendor@artisangoods.com",
        type: "vendor",
        products: [101, 102, 103, 104],
        dateJoined: "2023-01-15"
    }
];

// Mock Vendors
const mockVendors = [
    {
        id: 1,
        name: "Rajasthani Handicrafts Collective",
        location: "Jaipur, Rajasthan",
        description: "A cooperative of artisans specializing in traditional Rajasthani crafts including textiles, pottery, and jewelry.",
        established: 1978,
        artisanCount: 120,
        rating: 4.8,
        image: "images/vendors/rajasthan.jpg"
    },
    {
        id: 2,
        name: "Madhubani Art Center",
        location: "Madhubani, Bihar",
        description: "A women-led cooperative promoting the ancient art form of Madhubani painting and supporting local female artists.",
        established: 1995,
        artisanCount: 85,
        rating: 4.9,
        image: "images/vendors/madhubani.jpg"
    },
    {
        id: 3,
        name: "Himalayan Organic Farmers",
        location: "Dehradun, Uttarakhand",
        description: "A collective of small-scale farmers producing organic herbs, spices, and honey using sustainable farming practices in the Himalayan foothills.",
        established: 2005,
        artisanCount: 150,
        rating: 4.7,
        image: "images/vendors/himalayan.jpg"
    },
    {
        id: 4,
        name: "Kerala Crafts Emporium",
        location: "Kochi, Kerala",
        description: "Artisans specializing in traditional Kerala crafts including wood carving, coir products, and coconut shell crafts.",
        established: 1986,
        artisanCount: 95,
        rating: 4.8,
        image: "images/vendors/kerala.jpg"
    },
    {
        id: 5,
        name: "Tribal Art Foundation",
        location: "Bhopal, Madhya Pradesh",
        description: "An organization supporting tribal artists from central India, specializing in Gond art, Bastar crafts, and tribal jewelry.",
        established: 2001,
        artisanCount: 75,
        rating: 4.9,
        image: "images/vendors/tribal.jpg"
    },
    {
        id: 6,
        name: "Varanasi Silk Weavers",
        location: "Varanasi, Uttar Pradesh",
        description: "A collective of master weavers creating exquisite Banarasi silk textiles using traditional handloom techniques passed down through generations.",
        established: 1965,
        artisanCount: 110,
        rating: 5.0,
        image: "images/vendors/varanasi.jpg"
    },
    {
        id: 7,
        name: "Bengal Potters",
        location: "Kolkata, West Bengal",
        description: "A group of skilled potters creating traditional Bengali terracotta and ceramic items using age-old techniques.",
        established: 1992,
        artisanCount: 65,
        rating: 4.7,
        image: "images/vendors/bengal.jpg"
    }
];

// Extended Product Listings (linked to vendors)
const extendedProductListings = [
    // Textile Products
    {
        id: 101,
        name: "Handwoven Off-White Khadi Cotton Saree",
        description: "Traditional handwoven khadi cotton saree with multicolor strips and pallu. Each piece is meticulously crafted by skilled artisans using age-old techniques.",
        price: 3499,
        category: "textiles",
        image: "images/Textile/Saree_OffWhite.jpg",
        stock: 15,
        rating: 4.8,
        reviewCount: 32,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Varanasi Silk Weavers",
        vendorId: 6,
        location: "Varanasi, Uttar Pradesh",
        materials: ["100% Khadi Cotton", "Natural Dyes"],
        dimensions: "5.5 meters with 0.8 meter blouse piece",
        careInstructions: "Gentle hand wash with mild detergent",
        sku: "VSW-TX-101"
    },
    {
        id: 102,
        name: "Fancy Handloom Bed Sheet",
        description: "Exquisite handloom bed sheet featuring intricate traditional patterns. Made from premium cotton for comfort and durability.",
        price: 1899,
        category: "textiles",
        image: "images/Textile/BedSheet.png",
        stock: 25,
        rating: 4.7,
        reviewCount: 28,
        featured: false,
        dateAdded: "2023-06-02",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["100% Cotton", "Natural Dyes"],
        dimensions: "90 x 108 inches",
        careInstructions: "Machine wash cold, tumble dry low",
        sku: "RHC-TX-102"
    },
    {
        id: 103,
        name: "Traditional Silk Saree",
        description: "Beautiful traditional silk saree with intricate designs and rich colors. Perfect for special occasions and festivals.",
        price: 7999,
        category: "textiles",
        image: "images/Textile/saree  .jpg",
        stock: 10,
        rating: 4.9,
        reviewCount: 45,
        featured: true,
        dateAdded: "2023-04-20",
        vendor: "Varanasi Silk Weavers",
        vendorId: 6,
        location: "Varanasi, Uttar Pradesh",
        materials: ["Pure Silk", "Zari Work"],
        dimensions: "5.5 meters with 0.8 meter blouse piece",
        careInstructions: "Dry clean only",
        sku: "VSW-TX-103"
    },
    {
        id: 104,
        name: "Handloom Cotton Saree",
        description: "Elegant handloom cotton saree with traditional patterns. Lightweight and perfect for everyday wear.",
        price: 2499,
        category: "textiles",
        image: "images/Textile/Saree.jpg",
        stock: 20,
        rating: 4.6,
        reviewCount: 36,
        featured: false,
        dateAdded: "2023-05-10",
        vendor: "Madhubani Art Center",
        vendorId: 2,
        location: "Madhubani, Bihar",
        materials: ["Handloom Cotton"],
        dimensions: "5.5 meters",
        careInstructions: "Gentle hand wash with mild detergent",
        sku: "MAC-TX-104"
    },
    {
        id: 105,
        name: "Designer Bed Sheet Set",
        description: "Premium designer bed sheet set with pillow covers. Features elegant patterns and soft, comfortable fabric.",
        price: 2199,
        category: "textiles",
        image: "images/Textile/BeadSheet.avif",
        stock: 15,
        rating: 4.7,
        reviewCount: 24,
        featured: false,
        dateAdded: "2023-06-15",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Cotton Blend"],
        dimensions: "King Size with 2 Pillow Covers",
        careInstructions: "Machine wash cold",
        sku: "RHC-TX-105"
    },
    {
        id: 106,
        name: "Handloom Dhoti with Korvai Beldari Strips",
        description: "Traditional handloom dhoti with korvai beldari strips in pastel pink and purple. Perfect for ceremonies and special occasions.",
        price: 1499,
        category: "textiles",
        image: "images/Textile/Dhoti.webp",
        stock: 30,
        rating: 4.5,
        reviewCount: 19,
        featured: false,
        dateAdded: "2023-05-25",
        vendor: "Varanasi Silk Weavers",
        vendorId: 6,
        location: "Varanasi, Uttar Pradesh",
        materials: ["100% Cotton"],
        dimensions: "4.5 meters",
        careInstructions: "Hand wash with mild detergent",
        sku: "VSW-TX-106"
    },
    
    // Pottery and Ceramics Products
    {
        id: 201,
        name: "Handcrafted Ceramic Bowl Set",
        description: "Set of 3 handcrafted ceramic bowls with traditional designs. Each piece is hand-painted by skilled artisans.",
        price: 1899,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_Bowl.jpg",
        stock: 20,
        rating: 4.8,
        reviewCount: 27,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Bengal Potters",
        vendorId: 7,
        location: "Kolkata, West Bengal",
        materials: ["Ceramic", "Lead-free Glaze"],
        dimensions: "6 inch diameter each",
        careInstructions: "Dishwasher safe, microwave safe",
        sku: "BP-PO-201"
    },
    {
        id: 202,
        name: "Traditional Ceramic Cup Set",
        description: "Set of 4 traditional ceramic cups with intricate hand-painted designs. Perfect for serving tea or coffee.",
        price: 1299,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_Cup.jpg",
        stock: 25,
        rating: 4.6,
        reviewCount: 32,
        featured: false,
        dateAdded: "2023-06-10",
        vendor: "Bengal Potters",
        vendorId: 7,
        location: "Kolkata, West Bengal",
        materials: ["Ceramic", "Food-safe Glaze"],
        dimensions: "3 inch height, 2.5 inch diameter",
        careInstructions: "Hand wash recommended",
        sku: "BP-PO-202"
    },
    {
        id: 203,
        name: "Clay Craft Handi Pot",
        description: "Traditional clay craft handi pot with lid. Perfect for slow cooking and serving traditional dishes.",
        price: 1499,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_handi_pot.webp",
        stock: 15,
        rating: 4.9,
        reviewCount: 21,
        featured: true,
        dateAdded: "2023-04-25",
        vendor: "Bengal Potters",
        vendorId: 7,
        location: "Kolkata, West Bengal",
        materials: ["Terracotta Clay"],
        dimensions: "700 ml capacity",
        careInstructions: "Hand wash only, not microwave safe",
        sku: "BP-PO-203"
    },
    {
        id: 204,
        name: "Decorative Ceramic Bowl",
        description: "Handcrafted decorative ceramic bowl with traditional designs. Perfect for serving or as a decorative piece.",
        price: 999,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_Bowl.webp",
        stock: 30,
        rating: 4.7,
        reviewCount: 18,
        featured: false,
        dateAdded: "2023-05-20",
        vendor: "Bengal Potters",
        vendorId: 7,
        location: "Kolkata, West Bengal",
        materials: ["Ceramic", "Lead-free Glaze"],
        dimensions: "8 inch diameter",
        careInstructions: "Hand wash recommended",
        sku: "BP-PO-204"
    },
    {
        id: 205,
        name: "Handcrafted Ceramic Glass Set",
        description: "Set of 6 handcrafted ceramic glasses with traditional patterns. Perfect for serving water or beverages.",
        price: 1199,
        category: "pottery",
        image: "images/Pottery and ceramics/Ceramic_Glass.jpg",
        stock: 20,
        rating: 4.5,
        reviewCount: 24,
        featured: false,
        dateAdded: "2023-06-05",
        vendor: "Bengal Potters",
        vendorId: 7,
        location: "Kolkata, West Bengal",
        materials: ["Ceramic", "Food-safe Glaze"],
        dimensions: "4 inch height, 2.5 inch diameter",
        careInstructions: "Hand wash recommended",
        sku: "BP-PO-205"
    },
    
    // Traditional Jewellery Products
    {
        id: 301,
        name: "Traditional Silver Necklace",
        description: "Handcrafted silver necklace with intricate filigree work. Made by skilled artisans using traditional techniques.",
        price: 5999,
        category: "jewelry",
        image: "images/Traditional Jewellery/Jewellery.jpg",
        stock: 10,
        rating: 4.9,
        reviewCount: 28,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Sterling Silver"],
        dimensions: "18 inches length",
        careInstructions: "Clean with soft cloth, store in dry place",
        sku: "RHC-JW-301"
    },
    {
        id: 302,
        name: "Traditional Gold-Plated Earrings",
        description: "Handcrafted gold-plated earrings with traditional designs. Perfect for special occasions and festivals.",
        price: 1999,
        category: "jewelry",
        image: "images/Traditional Jewellery/Jewellery .jpg",
        stock: 15,
        rating: 4.7,
        reviewCount: 32,
        featured: false,
        dateAdded: "2023-06-10",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Gold-Plated Brass"],
        dimensions: "2 inches drop",
        careInstructions: "Clean with soft cloth, avoid contact with water",
        sku: "RHC-JW-302"
    },
    {
        id: 303,
        name: "Traditional Bridal Jewelry Set",
        description: "Complete traditional bridal jewelry set including necklace, earrings, and maang tikka. Handcrafted with intricate designs.",
        price: 12999,
        category: "jewelry",
        image: "images/Traditional Jewellery/jewellery_.jpg",
        stock: 5,
        rating: 5.0,
        reviewCount: 15,
        featured: true,
        dateAdded: "2023-04-20",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Gold-Plated Silver", "Semi-precious Stones"],
        dimensions: "Necklace: 16 inches, Earrings: 2.5 inches drop",
        careInstructions: "Store in dry place, clean with soft cloth",
        sku: "RHC-JW-303"
    },
    {
        id: 304,
        name: "Silver Anklet Pair",
        description: "Handcrafted silver anklet pair with traditional bell designs. Made by skilled artisans using age-old techniques.",
        price: 2499,
        category: "jewelry",
        image: "images/Traditional Jewellery/Jewellery  .jpg",
        stock: 20,
        rating: 4.8,
        reviewCount: 24,
        featured: false,
        dateAdded: "2023-05-25",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Sterling Silver"],
        dimensions: "Adjustable size",
        careInstructions: "Clean with soft cloth, avoid contact with water",
        sku: "RHC-JW-304"
    },
    {
        id: 305,
        name: "Traditional Bangles Set",
        description: "Set of 6 traditional handcrafted bangles with intricate designs. Perfect for daily wear or special occasions.",
        price: 1499,
        category: "jewelry",
        image: "images/Traditional Jewellery/Jwellery.jpg",
        stock: 25,
        rating: 4.6,
        reviewCount: 30,
        featured: false,
        dateAdded: "2023-06-05",
        vendor: "Rajasthani Handicrafts Collective",
        vendorId: 1,
        location: "Jaipur, Rajasthan",
        materials: ["Brass with Gold Plating"],
        dimensions: "2.5 inch diameter",
        careInstructions: "Wipe with soft cloth, store in dry place",
        sku: "RHC-JW-305"
    },
    
    // Organic Products
    {
        id: 401,
        name: "Organic Ginger Powder",
        description: "100% organic ginger powder made from fresh ginger roots. Perfect for cooking, baking, and herbal remedies.",
        price: 299,
        category: "organic",
        image: "images/Organic Products/Ginger_Powder.webp",
        stock: 50,
        rating: 4.8,
        reviewCount: 42,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Himalayan Organic Farmers",
        vendorId: 3,
        location: "Dehradun, Uttarakhand",
        materials: ["100% Organic Ginger"],
        dimensions: "200g package",
        careInstructions: "Store in cool, dry place away from sunlight",
        sku: "HOF-OR-401"
    },
    {
        id: 402,
        name: "Organic Ragi Flour",
        description: "Stone-ground organic ragi (finger millet) flour. Rich in calcium, iron, and fiber. Perfect for making traditional dishes.",
        price: 249,
        category: "organic",
        image: "images/Organic Products/Ragi_Powder.webp",
        stock: 40,
        rating: 4.7,
        reviewCount: 35,
        featured: false,
        dateAdded: "2023-06-10",
        vendor: "Himalayan Organic Farmers",
        vendorId: 3,
        location: "Dehradun, Uttarakhand",
        materials: ["100% Organic Ragi"],
        dimensions: "500g package",
        careInstructions: "Store in airtight container in cool, dry place",
        sku: "HOF-OR-402"
    },
    {
        id: 403,
        name: "Organic Dates Powder",
        description: "100% natural dates powder made from premium organic dates. Perfect natural sweetener for smoothies, desserts, and baking.",
        price: 349,
        category: "organic",
        image: "images/Organic Products/Dates_Powder.webp",
        stock: 30,
        rating: 4.9,
        reviewCount: 28,
        featured: true,
        dateAdded: "2023-04-25",
        vendor: "Himalayan Organic Farmers",
        vendorId: 3,
        location: "Dehradun, Uttarakhand",
        materials: ["100% Organic Dates"],
        dimensions: "250g package",
        careInstructions: "Store in cool, dry place away from sunlight",
        sku: "HOF-OR-403"
    },
    {
        id: 404,
        name: "Organic MCT Oil",
        description: "Pure organic MCT oil extracted from coconuts. Perfect for keto diet, bulletproof coffee, and as a natural energy booster.",
        price: 699,
        category: "organic",
        image: "images/Organic Products/MCT_pdp_image_01_-_v2.webp",
        stock: 25,
        rating: 4.8,
        reviewCount: 32,
        featured: false,
        dateAdded: "2023-05-20",
        vendor: "Himalayan Organic Farmers",
        vendorId: 3,
        location: "Dehradun, Uttarakhand",
        materials: ["100% Organic Coconut Oil"],
        dimensions: "500ml bottle",
        careInstructions: "Store in cool, dry place away from direct sunlight",
        sku: "HOF-OR-404"
    },
    {
        id: 405,
        name: "Organic Chana Dal",
        description: "Premium quality organic chana dal (split chickpeas). Rich in protein and fiber. Perfect for traditional Indian dishes.",
        price: 199,
        category: "organic",
        image: "images/Organic Products/CHANA_DAL.webp",
        stock: 60,
        rating: 4.6,
        reviewCount: 40,
        featured: false,
        dateAdded: "2023-06-05",
        vendor: "Himalayan Organic Farmers",
        vendorId: 3,
        location: "Dehradun, Uttarakhand",
        materials: ["100% Organic Chana Dal"],
        dimensions: "500g package",
        careInstructions: "Store in airtight container in cool, dry place",
        sku: "HOF-OR-405"
    },
    
    // Tribal Art Products
    {
        id: 501,
        name: "Tribal Art Figurine",
        description: "Handcrafted tribal art figurine made by skilled artisans. Each piece is unique with distinctive tribal motifs.",
        price: 1999,
        category: "tribal",
        image: "images/Tribal Art/Art_figure.jpg",
        stock: 15,
        rating: 4.8,
        reviewCount: 24,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Tribal Art Foundation",
        vendorId: 5,
        location: "Bhopal, Madhya Pradesh",
        materials: ["Terracotta", "Natural Colors"],
        dimensions: "12 inches height",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "TAF-TR-501"
    },
    {
        id: 502,
        name: "Traditional Tribal Painting",
        description: "Original hand-painted tribal art on handmade paper. Features traditional motifs and natural colors.",
        price: 3499,
        category: "tribal",
        image: "images/Tribal Art/Art.jpg",
        stock: 10,
        rating: 5.0,
        reviewCount: 18,
        featured: true,
        dateAdded: "2023-04-20",
        vendor: "Tribal Art Foundation",
        vendorId: 5,
        location: "Bhopal, Madhya Pradesh",
        materials: ["Handmade Paper", "Natural Colors"],
        dimensions: "18 x 24 inches",
        careInstructions: "Keep away from direct sunlight and moisture",
        sku: "TAF-TR-502"
    },
    {
        id: 503,
        name: "Tribal Art Wall Hanging",
        description: "Handcrafted tribal art wall hanging with traditional designs. Perfect for home decor and adding a cultural touch.",
        price: 2499,
        category: "tribal",
        image: "images/Tribal Art/Art_.jpg",
        stock: 20,
        rating: 4.7,
        reviewCount: 30,
        featured: false,
        dateAdded: "2023-06-10",
        vendor: "Tribal Art Foundation",
        vendorId: 5,
        location: "Bhopal, Madhya Pradesh",
        materials: ["Wood", "Natural Colors"],
        dimensions: "24 x 18 inches",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "TAF-TR-503"
    },
    {
        id: 504,
        name: "Warli Painting - Tribal Dance",
        description: "Traditional Warli painting depicting tribal dance scene. Hand-painted by tribal artisans from Maharashtra.",
        price: 1799,
        category: "tribal",
        image: "images/Tribal Art/Art.webp",
        stock: 15,
        rating: 4.8,
        reviewCount: 22,
        featured: false,
        dateAdded: "2023-05-25",
        vendor: "Tribal Art Foundation",
        vendorId: 5,
        location: "Bhopal, Madhya Pradesh",
        materials: ["Handmade Paper", "Natural Colors"],
        dimensions: "12 x 16 inches",
        careInstructions: "Keep away from direct sunlight and moisture",
        sku: "TAF-TR-504"
    },
    {
        id: 505,
        name: "Tribal Art Decorative Piece",
        description: "Handcrafted tribal art decorative piece for home decor. Features traditional designs and motifs.",
        price: 1299,
        category: "tribal",
        image: "images/Tribal Art/Art_image.jpg",
        stock: 25,
        rating: 4.6,
        reviewCount: 28,
        featured: false,
        dateAdded: "2023-06-05",
        vendor: "Tribal Art Foundation",
        vendorId: 5,
        location: "Bhopal, Madhya Pradesh",
        materials: ["Wood", "Natural Colors"],
        dimensions: "8 inches height",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "TAF-TR-505"
    },
    
    // Wood Crafts Products
    {
        id: 601,
        name: "Handcrafted Wooden Basket",
        description: "Beautifully handcrafted wooden basket made by skilled artisans. Perfect for storage or as a decorative piece.",
        price: 1499,
        category: "woodcraft",
        image: "images/Wood crafts/Wood_basket.jpg",
        stock: 20,
        rating: 4.7,
        reviewCount: 32,
        featured: true,
        dateAdded: "2023-05-15",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Sustainable Wood"],
        dimensions: "12 x 8 x 6 inches",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "KCE-WC-601"
    },
    {
        id: 602,
        name: "Wooden Serving Tray",
        description: "Elegant handcrafted wooden serving tray with handles. Perfect for serving food or as a decorative piece.",
        price: 1299,
        category: "woodcraft",
        image: "images/Wood crafts/Wood_tray.jpg",
        stock: 25,
        rating: 4.8,
        reviewCount: 28,
        featured: false,
        dateAdded: "2023-06-10",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Mango Wood"],
        dimensions: "18 x 12 inches",
        careInstructions: "Hand wash with mild soap, dry immediately",
        sku: "KCE-WC-602"
    },
    {
        id: 603,
        name: "Wooden Wall Clock",
        description: "Handcrafted wooden wall clock with traditional designs. A perfect blend of functionality and traditional art.",
        price: 1999,
        category: "woodcraft",
        image: "images/Wood crafts/wood_clock.jpg",
        stock: 15,
        rating: 4.9,
        reviewCount: 20,
        featured: true,
        dateAdded: "2023-04-25",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Sheesham Wood"],
        dimensions: "12 inch diameter",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "KCE-WC-603"
    },
    {
        id: 604,
        name: "Wooden Kitchen Set",
        description: "Complete wooden kitchen set including spoons, spatulas, and ladles. Handcrafted from sustainable wood.",
        price: 1499,
        category: "woodcraft",
        image: "images/Wood crafts/wood_kitchen_Set.webp",
        stock: 30,
        rating: 4.7,
        reviewCount: 35,
        featured: false,
        dateAdded: "2023-05-20",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Neem Wood"],
        dimensions: "Various sizes",
        careInstructions: "Hand wash with mild soap, dry immediately",
        sku: "KCE-WC-604"
    },
    {
        id: 605,
        name: "Wooden Decorative Item",
        description: "Handcrafted wooden decorative item featuring traditional designs. Perfect for home decor.",
        price: 999,
        category: "woodcraft",
        image: "images/Wood crafts/Wooden-Decorative-item-online-1.jpg",
        stock: 35,
        rating: 4.6,
        reviewCount: 26,
        featured: false,
        dateAdded: "2023-06-05",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Rosewood"],
        dimensions: "10 inches height",
        careInstructions: "Wipe with soft dry cloth, avoid moisture",
        sku: "KCE-WC-605"
    },
    {
        id: 606,
        name: "Handcrafted Wooden Bowl Set",
        description: "Set of 3 handcrafted wooden bowls perfect for serving snacks, fruits, or as decorative pieces.",
        price: 1299,
        category: "woodcraft",
        image: "images/Wood crafts/wood_Bowl.jpg",
        stock: 20,
        rating: 4.8,
        reviewCount: 30,
        featured: true,
        dateAdded: "2023-05-10",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Mango Wood"],
        dimensions: "Various sizes (Small, Medium, Large)",
        careInstructions: "Hand wash with mild soap, dry immediately",
        sku: "KCE-WC-606"
    },
    {
        id: 607,
        name: "Wooden Dinner Plates Set",
        description: "Set of 4 handcrafted wooden dinner plates. Eco-friendly alternative to plastic or ceramic plates.",
        price: 1599,
        category: "woodcraft",
        image: "images/Wood crafts/Wood_plates.jpg",
        stock: 15,
        rating: 4.7,
        reviewCount: 25,
        featured: false,
        dateAdded: "2023-06-15",
        vendor: "Kerala Crafts Emporium",
        vendorId: 4,
        location: "Kochi, Kerala",
        materials: ["Acacia Wood"],
        dimensions: "10 inch diameter each",
        careInstructions: "Hand wash with mild soap, dry immediately",
        sku: "KCE-WC-607"
    }
]; 