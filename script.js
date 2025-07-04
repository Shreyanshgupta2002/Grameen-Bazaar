// FAQ Toggle
document.querySelectorAll('.faq-item h3').forEach((faqQuestion) => {
    faqQuestion.addEventListener('click', () => {
        faqQuestion.nextElementSibling.classList.toggle('active');
    });
});

// Navbar Scroll Animation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// FAQ Toggle with Animation
document.querySelectorAll('.faq-item h3').forEach((faqQuestion) => {
    faqQuestion.addEventListener('click', () => {
        const answer = faqQuestion.nextElementSibling;
        answer.style.transition = 'max-height 0.5s ease, opacity 0.5s ease';
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            answer.style.opacity = 0;
        } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.opacity = 1;
        }
    });
});

// Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Offset for fixed navbar
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Make images responsive
window.addEventListener('load', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });
});

// DOM Elements
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize database connection
    if (!window.dbService) {
        console.error('Database service not available');
        // Add a fallback to initialize the database if not already available
        window.dbService = new DatabaseService();
    }
    
    try {
        // Ensure database is initialized before loading any content
        await window.dbService.init();
        console.log('Database initialized successfully');
        
        // Fix product image paths
        await fixProductImagePaths();
        
        // Update product database with correct image paths
        await updateProductDatabase();
        
        // Update product prices with new category-specific ranges
        await updateProductPrices();
        
        // Create placeholder images for categories
        createPlaceholderImages();
        
        // Preload product images
        const products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
        preloadImages(products);
        
        // Load initial data
        loadProducts();
        loadFeaturedProducts();
        loadProductCarousel();
        loadArtisans();
        updateCartCount();
        updateCartUI();
        loadUserData();
        
        // Set up login, signup, and cart functionality
        setupUserInterface();
        
        // Set up filter event listeners
        setupFilterEventListeners();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
    
    // Function to set up user interface elements
    function setupUserInterface() {
        // Direct event listeners for critical UI elements
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const cartIcon = document.querySelector('.cart-icon');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const cartModal = document.getElementById('cart-modal');
        
        console.log('Setting up UI elements:', { 
            loginBtn, signupBtn, cartIcon, 
            loginModal, signupModal, cartModal 
        });
        
        // Direct event listeners for buttons
        if (loginBtn) {
            loginBtn.onclick = function() {
                console.log('Login button clicked');
                if (loginModal) {
                    loginModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            };
        }
        
        if (signupBtn) {
            signupBtn.onclick = function() {
                console.log('Signup button clicked');
                if (signupModal) {
                    signupModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            };
        }
        
        if (cartIcon) {
            cartIcon.onclick = function() {
                console.log('Cart icon clicked');
                if (cartModal) {
                    cartModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            };
        }
        
        // Close buttons for modals
        document.querySelectorAll('.close-modal').forEach(button => {
            button.onclick = function() {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
                document.body.style.overflow = '';
            };
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
        
        // Set up login and signup forms
        setupLoginAndSignup();
    }
    
    // Function to set up login and signup functionality
    function setupLoginAndSignup() {
        // Get DOM elements
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const showSignupLink = document.getElementById('show-signup');
        const showLoginLink = document.getElementById('show-login');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        
        console.log('Setting up login/signup:', { 
            loginBtn, signupBtn, loginModal, signupModal, 
            loginForm, signupForm, showSignupLink, showLoginLink 
        });
        
        // Modal Functions
        function openModal(modal) {
            if (!modal) {
                console.error('Modal not found');
                return;
            }
            console.log('Opening modal:', modal);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }
        
        function closeModal(modal) {
            if (!modal) return;
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Re-enable scrolling
        }
        
        function closeAllModals() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                closeModal(modal);
            });
        }
        
        // Modal Event Listeners
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('Login button clicked');
                openModal(loginModal);
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                console.log('Signup button clicked');
                openModal(signupModal);
            });
        }
        
        if (showSignupLink) {
            showSignupLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(loginModal);
                openModal(signupModal);
            });
        }
        
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(signupModal);
                openModal(loginModal);
            });
        }
        
        // Close modals
        if (closeModalButtons) {
            closeModalButtons.forEach(button => {
                button.addEventListener('click', () => {
                    closeAllModals();
                });
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
        
        // Handle login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                // For demo purposes, just simulate a successful login
                console.log(`Login attempt with email: ${email}`);
                
                // Close the modal
                closeAllModals();
                
                // Update UI to show logged-in state
                updateLoggedInUI(email);
                
                // Show success message
                alert(`Successfully logged in as ${email}`);
            });
        }
        
        // Handle signup form submission
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const accountType = document.querySelector('input[name="account-type"]:checked')?.value || 'customer';
                
                // For demo purposes, just simulate a successful signup
                console.log(`Signup attempt with email: ${email}, account type: ${accountType}`);
                
                // Close the modal
                closeAllModals();
                
                // Update UI to show logged-in state
                updateLoggedInUI(email);
                
                // Show success message
                alert(`Account created successfully! Welcome, ${name}!`);
            });
        }
    }
    
    // Function to update UI to show logged-in state
    function updateLoggedInUI(email) {
        // Hide login/signup buttons
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        
        // Show user info in nav
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            // Create user info element if it doesn't exist
            if (!document.querySelector('.user-info')) {
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';
                userInfo.innerHTML = `
                    <span class="user-email">${email}</span>
                    <button id="logout-btn" class="btn-text">Logout</button>
                `;
                userActions.insertBefore(userInfo, userActions.firstChild);
                
                // Add logout functionality
                document.getElementById('logout-btn').addEventListener('click', () => {
                    // Remove user info
                    userActions.removeChild(userInfo);
                    
                    // Show login/signup buttons
                    if (loginBtn) loginBtn.style.display = '';
                    if (signupBtn) signupBtn.style.display = '';
                    
                    // Show success message
                    alert('You have been logged out.');
                });
            }
        }
        
        // Show vendor dashboard content
        document.querySelectorAll('.login-required').forEach(element => {
            element.style.display = 'none';
        });
        
        // Load vendor products (for demo)
        loadVendorProducts();
    }
    
    // Load vendor products (for demo)
    function loadVendorProducts() {
        const vendorProductsContainer = document.getElementById('vendor-products');
        if (!vendorProductsContainer) return;
        
        // For demo, just show a message
        vendorProductsContainer.innerHTML = `
            <p>You don't have any products yet.</p>
            <button class="btn-primary" onclick="document.querySelector('[data-tab=\\'add-product\\']').click()">
                Add Your First Product
            </button>
        `;
    }
    
    // Function to fix product image paths
    async function fixProductImagePaths() {
        try {
            console.log('Fixing product image paths...');
            
            // Get all products
            const products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Define the available categories based on your folder structure
            const categories = [
                'Textile',
                'Pottery and ceramics',
                'Traditional Jewellery',
                'Organic Products',
                'Tribal Art',
                'Wood crafts'
            ];
            
            // Process each product
            for (const product of products) {
                if (!product.image) continue;
                
                // Normalize the image path first
                const normalizedPath = normalizeImagePath(product.image);
                if (normalizedPath !== product.image) {
                    console.log(`Normalized path for product ${product.id}: ${normalizedPath}`);
                    product.image = normalizedPath;
                    await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                }
                
                // Extract category from the image path
                let category = null;
                for (const cat of categories) {
                    if (product.image.includes(`images/${cat}/`)) {
                        category = cat;
                        break;
                    }
                }
                
                if (!category) {
                    console.log(`Couldn't determine category for product ${product.id}: ${product.image}`);
                    continue;
                }
                
                // Extract filename from the path
                const filename = product.image.split('/').pop();
                if (!filename) continue;
                
                // Remove extension from filename
                const baseFilename = filename.replace(/\.[^/.]+$/, '');
                
                // Try to find a matching file in the category folder
                const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
                let found = false;
                
                for (const ext of extensions) {
                    const newPath = `images/${category}/${baseFilename}${ext}`;
                    const exists = await checkImage(newPath);
                    
                    if (exists) {
                        console.log(`Found matching image for product ${product.id}: ${newPath}`);
                        
                        // Update product image path
                        product.image = newPath;
                        await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                        
                        found = true;
                        break;
                    }
                }
                
                // If no match found with the exact filename, try to find a file with a similar name
                if (!found) {
                    // Try matching without spaces
                    const cleanFilename = baseFilename.replace(/\s+/g, '');
                    
                    for (const ext of extensions) {
                        const newPath = `images/${category}/${cleanFilename}${ext}`;
                        const exists = await checkImage(newPath);
                        
                        if (exists) {
                            console.log(`Found similar image for product ${product.id}: ${newPath}`);
                            
                            // Update product image path
                            product.image = newPath;
                            await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                            
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found) {
                    console.log(`Couldn't find a matching image for product ${product.id}: ${product.image}`);
                }
            }
            
            console.log('Finished fixing product image paths');
        } catch (error) {
            console.error('Error fixing product image paths:', error);
        }
    }
    
    // Function to create placeholder images for categories
    function createPlaceholderImages() {
        const categories = [
            { folder: 'Textile', color: '#f8e9e2' },
            { folder: 'Pottery and ceramics', color: '#e2e8f8' },
            { folder: 'Traditional Jewellery', color: '#f8f2e2' },
            { folder: 'Organic Products', color: '#e2f8e8' },
            { folder: 'Tribal Art', color: '#f8e2e2' },
            { folder: 'Wood crafts', color: '#e8e2d4' }
        ];
        
        // Create a default placeholder
        const defaultPlaceholder = document.createElement('img');
        defaultPlaceholder.width = 1;
        defaultPlaceholder.height = 1;
        defaultPlaceholder.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">Image not found</text></svg>';
        
        // Create category-specific placeholders
        categories.forEach(category => {
            const placeholder = document.createElement('img');
            placeholder.width = 1;
            placeholder.height = 1;
            placeholder.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${category.color}"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23666">${category.folder}</text></svg>`;
            
            // Store in a global object for easy access
            if (!window.placeholders) window.placeholders = {};
            window.placeholders[category.folder] = placeholder.src;
        });
    }
    
    // Function to preload images
    function preloadImages(products) {
        if (!products || products.length === 0) return;
        
        console.log(`Preloading ${products.length} product images...`);
        
        products.forEach(product => {
            if (product.image) {
                const img = new Image();
                img.src = product.image;
                img.onload = () => console.log(`Image loaded successfully: ${product.image}`);
                img.onerror = () => {
                    console.error(`Failed to load image: ${product.image}`);
                    // Try to fix common image path issues
                    if (product.image.includes(' ')) {
                        const fixedPath = product.image.replace(/\s+/g, '');
                        console.log(`Attempting to fix image path: ${fixedPath}`);
                        const retryImg = new Image();
                        retryImg.src = fixedPath;
                        // Update product image path if the fixed path works
                        retryImg.onload = () => {
                            console.log(`Fixed image loaded successfully: ${fixedPath}`);
                            product.image = fixedPath;
                            window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                        };
                    }
                };
            }
        });
    }
    
    // Function to validate if an image exists
    function validateImageExists(imagePath) {
        return new Promise(async (resolve) => {
            // First normalize the path to ensure folder names are correct
            const normalizedPath = normalizeImagePath(imagePath);
            
            // Try with the normalized path
            const img = new Image();
            img.onload = () => {
                console.log(`Image loaded successfully: ${normalizedPath}`);
                // If the normalized path is different from the original, update it
                if (normalizedPath !== imagePath) {
                    const productId = getProductIdFromImagePath(imagePath);
                    if (productId) {
                        updateProductImagePath(productId, normalizedPath);
                    }
                }
                resolve(true);
            };
            img.onerror = async () => {
                console.log(`Failed to load image: ${normalizedPath}`);
                
                // If normalized path fails, try with different extensions
                const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
                const basePath = normalizedPath.replace(/\.[^/.]+$/, ''); // Remove extension
                
                // Try each extension
                for (const ext of extensions) {
                    const newPath = basePath + ext;
                    const exists = await checkImage(newPath);
                    if (exists) {
                        console.log(`Found image with different extension: ${newPath}`);
                        // Update the product's image path in the database
                        const productId = getProductIdFromImagePath(imagePath);
                        if (productId) {
                            updateProductImagePath(productId, newPath);
                        }
                        return resolve(true);
                    }
                }
                
                // If all attempts fail, check if there's a space in the filename (not folder names)
                const pathParts = normalizedPath.split('/');
                if (pathParts.length > 0) {
                    const filename = pathParts[pathParts.length - 1];
                    if (filename && filename.includes(' ')) {
                        pathParts[pathParts.length - 1] = filename.replace(/\s+/g, '');
                        const fixedPath = pathParts.join('/');
                        
                        const exists = await checkImage(fixedPath);
                        if (exists) {
                            console.log(`Found image with spaces removed from filename: ${fixedPath}`);
                            // Update the product's image path in the database
                            const productId = getProductIdFromImagePath(imagePath);
                            if (productId) {
                                updateProductImagePath(productId, fixedPath);
                            }
                            return resolve(true);
                        }
                    }
                }
                
                // If all attempts fail
                resolve(false);
            };
            img.src = normalizedPath;
        });
    }
    
    // Helper function to check if an image exists
    function checkImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }
    
    // Helper function to get product ID from image path
    function getProductIdFromImagePath(imagePath) {
        // This is a placeholder - in a real implementation, you would need to query the database
        // to find the product with this image path
        return null;
    }
    
    // Helper function to normalize image paths
    function normalizeImagePath(path) {
        if (!path) return path;
        
        // Define the correct folder names with spaces
        const correctFolderNames = [
            'Textile',
            'Pottery and ceramics',
            'Traditional Jewellery',
            'Organic Products',
            'Tribal Art',
            'Wood crafts'
        ];
        
        // Check if the path has incorrect folder names (without spaces)
        const incorrectFolderPatterns = [
            { incorrect: 'Potteryandceramics', correct: 'Pottery and ceramics' },
            { incorrect: 'TraditionalJewellery', correct: 'Traditional Jewellery' },
            { incorrect: 'OrganicProducts', correct: 'Organic Products' },
            { incorrect: 'TribalArt', correct: 'Tribal Art' },
            { incorrect: 'Woodcrafts', correct: 'Wood crafts' }
        ];
        
        // Replace incorrect folder names with correct ones
        let normalizedPath = path;
        for (const pattern of incorrectFolderPatterns) {
            if (normalizedPath.includes(`/images/${pattern.incorrect}/`)) {
                normalizedPath = normalizedPath.replace(
                    `/images/${pattern.incorrect}/`, 
                    `/images/${pattern.correct}/`
                );
                console.log(`Normalized path from ${path} to ${normalizedPath}`);
            }
        }
        
        return normalizedPath;
    }
    
    // Helper function to update product image path in the database
    async function updateProductImagePath(productId, newPath) {
        if (!productId) return;
        
        try {
            // Get the product from the database
            const product = await window.dbService.getById(OBJECT_STORES.PRODUCTS, productId);
            if (product) {
                // Update the image path
                product.image = newPath;
                // Save the updated product back to the database
                await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                console.log(`Updated product ${productId} with new image path: ${newPath}`);
            }
        } catch (error) {
            console.error(`Failed to update product ${productId} image path:`, error);
        }
    }
    
    // Function to set up filter event listeners
    function setupFilterEventListeners() {
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const sortBy = document.getElementById('sort-by');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageIndicator = document.getElementById('page-indicator');
        
        console.log('Setting up filter event listeners:', { 
            categoryFilter: !!categoryFilter, 
            priceFilter: !!priceFilter, 
            sortBy: !!sortBy 
        });
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                console.log('Category filter changed to:', categoryFilter.value);
                filterProducts();
            });
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                console.log('Price filter changed to:', priceFilter.value);
                filterProducts();
            });
        }
        
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                console.log('Sort by changed to:', sortBy.value);
                filterProducts();
            });
        }
        
        // Pagination
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateProductsUI();
                    updatePagination();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateProductsUI();
                    updatePagination();
                }
            });
        }
        
        // Set up category card event listeners
        setupCategoryCards();
    }
    
    // Function to set up category card event listeners
    function setupCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        console.log('Setting up category cards:', categoryCards.length);
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                console.log('Category card clicked:', category);
                
                // Scroll to products section
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    window.scrollTo({
                        top: productsSection.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
                
                // Set the category filter value
                const categoryFilter = document.getElementById('category-filter');
                if (categoryFilter) {
                    categoryFilter.value = category;
                    // Trigger the change event
                    const event = new Event('change');
                    categoryFilter.dispatchEvent(event);
                } else {
                    // If filter not found, filter products directly
                    currentPage = 1;
                    const allProducts = window.allProducts || [];
                    currentProducts = allProducts.filter(product => product.category === category);
                    updateProductsUI();
                    updatePagination();
                }
            });
        });
    }
    
    // Initialize the application
    let currentPage = 1;
    let totalPages = 1;
    let currentProducts = [];
    let cart = [];
    
    // Product Functions
    async function loadProducts() {
        try {
            // Hide vendor dashboard if it exists
            const vendorDashboard = document.getElementById('vendor-dashboard');
            if (vendorDashboard) {
                vendorDashboard.style.display = 'none';
            }
            
            // Clear loading spinner immediately
            const productsContainer = document.getElementById('all-products');
            if (!productsContainer) return;
            
            // Remove the loading spinner
            const loadingSpinner = productsContainer.querySelector('.loading-spinner');
            if (loadingSpinner) {
                productsContainer.removeChild(loadingSpinner);
            }
            
            // Show temporary loading message
            productsContainer.innerHTML = '<p>Loading products from image folders...</p>';
            
            // Define the image categories to scan
            const categories = [
                { folder: 'Textile', id: 'textiles', name: 'Handloom Textiles' },
                { folder: 'Pottery and ceramics', id: 'pottery', name: 'Pottery & Ceramics' },
                { folder: 'Traditional Jewellery', id: 'jewelry', name: 'Traditional Jewelry' },
                { folder: 'Wood crafts', id: 'woodcraft', name: 'Wood Crafts' },
                { folder: 'Organic Products', id: 'organic', name: 'Organic Products' },
                { folder: 'Tribal Art', id: 'tribal', name: 'Tribal Art' }
            ];
            
            // Generate product data from image folders
            const products = [];
            let productId = 1;
            
            // For each category, scan the folder and create products
            for (const category of categories) {
                try {
                    console.log(`Scanning folder: images/${category.folder}`);
                    
                    // Get all image files in the directory
                    const imageFiles = await scanImageFolder(category.folder);
                    console.log(`Found ${imageFiles.length} images in ${category.folder}`);
                    
                    // Create products from images
                    for (const filename of imageFiles) {
                        const imagePath = `images/${category.folder}/${filename}`;
                        
                        // Generate a product name from the filename
                        const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
                        const productName = baseName
                            .replace(/[_-]/g, ' ')
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        
                        // Generate price based on category
                        let price;
                        switch (category.id) {
                            case 'textiles':
                                // Handloom Textiles (1000-3000)
                                price = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
                                break;
                            case 'pottery':
                                // Pottery & Ceramics (500-1000)
                                price = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
                                break;
                            case 'jewelry':
                                // Traditional Jewelry (1500-3000)
                                price = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500;
                                break;
                            case 'woodcraft':
                                // Wood Crafts (400-800)
                                price = Math.floor(Math.random() * (800 - 400 + 1)) + 400;
                                break;
                            case 'organic':
                                // Organic Products (400-1000)
                                price = Math.floor(Math.random() * (1000 - 400 + 1)) + 400;
                                break;
                            case 'tribal':
                                // Tribal Art (800-1200)
                                price = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
                                break;
                            default:
                                // Default range
                                price = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
                        }
                        
                        // Add product
                        products.push({
                            id: productId++,
                            name: productName || `${category.name} Item`,
                            description: `Beautiful handcrafted ${category.name.toLowerCase()} made by skilled artisans from rural India.`,
                            price: price,
                            rating: (3 + Math.random() * 2).toFixed(1), // Random rating between 3 and 5
                            image: imagePath,
                            category: category.id,
                            vendor: 'Local Artisan',
                            location: 'Rural India',
                            dateAdded: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.error(`Error processing ${category.folder} folder:`, error);
                }
            }
            
            console.log(`Generated ${products.length} products from image folders`);
            
            if (products.length === 0) {
                productsContainer.innerHTML = '<p class="error">No products found in the images folder</p>';
                return;
            }
            
            // Store all products in window.allProducts
            window.allProducts = [...products];
            console.log('Set window.allProducts with', window.allProducts.length, 'products');
            window.currentPage = 1;
            window.productsPerPage = 12;
            
            // Apply filters if any
            const categoryFilter = document.getElementById('category-filter');
            const priceFilter = document.getElementById('price-filter');
            const sortBy = document.getElementById('sort-by');
            
            const categoryValue = categoryFilter ? categoryFilter.value : 'all';
            const priceValue = priceFilter ? priceFilter.value : 'all';
            const sortValue = sortBy ? sortBy.value : 'newest';
            
            let filteredProducts = [...products];
            
            // Apply category filter
            if (categoryValue !== 'all') {
                filteredProducts = filteredProducts.filter(product => product.category === categoryValue);
            }
            
            // Apply price filter
            if (priceValue !== 'all') {
                const [min, max] = priceValue.split('-');
                if (max) {
                    filteredProducts = filteredProducts.filter(product => product.price >= parseInt(min) && product.price <= parseInt(max));
                } else {
                    // For "5000+" case
                    filteredProducts = filteredProducts.filter(product => product.price >= parseInt(min));
                }
            }
            
            // Apply sorting
            switch (sortValue) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'popular':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                default:
                    filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                    break;
            }
            
            // Update current products array for filtering
            currentProducts = filteredProducts;
            
            // Update UI
            updateProductsUI();
            updatePagination();
            
            // Save products to database for future use
            try {
                if (window.dbService) {
                    await window.dbService.clearStore(OBJECT_STORES.PRODUCTS);
                    for (const product of products) {
                        await window.dbService.add(OBJECT_STORES.PRODUCTS, product);
                    }
                    console.log(`Saved ${products.length} products to database`);
                }
            } catch (dbError) {
                console.error('Error saving products to database:', dbError);
            }
            
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Show error message if products fail to load
            const productsContainer = document.getElementById('all-products');
            if (productsContainer) {
                productsContainer.innerHTML = '<p class="error">Failed to load products from images folder. Please try again later.</p>';
            }
        }
    }
    
    // Function to scan an image folder and return all image filenames
    async function scanImageFolder(folderName) {
        return new Promise((resolve) => {
            console.log(`Scanning folder: images/${folderName}`);
            
            // Use hardcoded file lists since directory listing via fetch doesn't work in this environment
            const imageFiles = [];
            
            // Check which category we're dealing with
            if (folderName === 'Textile') {
                imageFiles.push('BedSheet.jpg', 'BedSheet.png', 'Dhoti.jpg', 'Saree.jpg', 'Saree.gif', 
                               'Saree (2).jpg', 'Saree_OffWhite.jpg', 'saree  .jpg', 'Saree .jpg');
            } else if (folderName === 'Pottery and ceramics') {
                imageFiles.push('Ceramic_Bowl.jpg', 'Ceramic_Bowl (2).jpg', 'Ceramic_Cup.jpg', 
                               'Ceramic_Glass.jpg', 'Ceramic_handi_pot.jpg');
            } else if (folderName === 'Traditional Jewellery') {
                imageFiles.push('Jewellery.jpg', 'Jewellery.jpeg', 'Jewellery_.jpg', 'jewellery_.jpg',
                               'Jewellery .jpg', 'Jewellery  .jpg', 'Jewellery (2).jpg', 'Jwellery.jpg');
            } else if (folderName === 'Organic Products') {
                imageFiles.push('Chai_Seed.jpg', 'CHANA_DAL.jpg', 'Dates_Powder.jpg', 'Ginger_Powder.jpg',
                               'images.jpg', 'MCT_pdp_image_01_-_v2.jpg', 'Ragi_Powder.jpg', 'Toor_Dal.jpg', 'Vanillafrosting.jpg');
            } else if (folderName === 'Tribal Art') {
                imageFiles.push('Art.jpg', 'Art_.jpg', 'Art (2).jpg', 'Art_figure.jpg', 
                               'Art_image.jpg', 'Art_marndi.jpg', 'Art_Wall.jpg');
            } else if (folderName === 'Wood crafts') {
                imageFiles.push('Wood_basket.jpg', 'wood_Bowl.jpg', 'wood_clock.jpg', 
                               'wood_kitchen_Set.jpg', 'Wood_plates.jpg', 'Wood_tray.jpg', 'Wooden-Decorative-item-online-1.jpg');
            }
            
            console.log(`Found ${imageFiles.length} images in ${folderName}`);
            resolve(imageFiles);
        });
    }
    
    // Function to update products UI
    function updateProductsUI() {
        const productsContainer = document.getElementById('all-products');
        if (!productsContainer) return;
        
        // Clear container
        productsContainer.innerHTML = '';
        
        // Check if we have products
        if (!currentProducts || currentProducts.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
            return;
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * window.productsPerPage;
        const endIndex = startIndex + window.productsPerPage;
        const paginatedProducts = currentProducts.slice(startIndex, endIndex);
        
        // Update total pages
        totalPages = Math.ceil(currentProducts.length / window.productsPerPage);
        
        // Create product cards
        paginatedProducts.forEach(product => {
            try {
                const productCard = createProductCard(product);
                productsContainer.appendChild(productCard);
            } catch (error) {
                console.error(`Error creating product card for ${product.name}:`, error);
            }
        });
        
        // If no products were rendered, show a message
        if (productsContainer.children.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
        }
    }
    
    async function loadFeaturedProducts() {
        try {
            const featuredProductsContainer = document.getElementById('featured-products');
            if (!featuredProductsContainer) return;
            
            // Clear loading spinner immediately
            const loadingSpinner = featuredProductsContainer.querySelector('.loading-spinner');
            if (loadingSpinner) {
                featuredProductsContainer.removeChild(loadingSpinner);
            }
            
            // Get featured products
            let featuredProducts = await window.dbService.getFeaturedProducts();
            
            // Filter products with valid images
            featuredProducts = await filterValidProducts(featuredProducts);
            
            // Limit to 8 products
            featuredProducts = featuredProducts.slice(0, 8);
            
            if (featuredProducts.length === 0) {
                featuredProductsContainer.innerHTML = '<p class="no-products">No featured products available at the moment.</p>';
                return;
            }
            
            // Create product cards
            featuredProducts.forEach(product => {
                const productCard = createProductCard(product);
                featuredProductsContainer.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error loading featured products:', error);
            
            // Show error message
            const featuredProductsContainer = document.getElementById('featured-products');
            if (featuredProductsContainer) {
                featuredProductsContainer.innerHTML = '<p class="error">Failed to load featured products. Please try again later.</p>';
            }
        }
    }

    // Load Product Carousel
    async function loadProductCarousel() {
        try {
            const productCarousel = document.getElementById('product-carousel');
            if (!productCarousel) return;
            
            // Clear loading spinner immediately
            const loadingSpinner = productCarousel.querySelector('.loading-spinner');
            if (loadingSpinner) {
                productCarousel.removeChild(loadingSpinner);
            }
            
            // Get all products
            let products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Filter products with valid images
            products = await filterValidProducts(products);
            
            // Sort by rating (highest first)
            products.sort((a, b) => b.rating - a.rating);
            
            // Take top 10 products
            const topProducts = products.slice(0, 10);
            
            if (topProducts.length === 0) {
                productCarousel.innerHTML = '<p class="no-products">No products available at the moment.</p>';
                return;
            }
            
            // Create product cards for carousel
            topProducts.forEach(product => {
                const productCard = createProductCard(product);
                productCarousel.appendChild(productCard);
            });
            
            // Add navigation buttons if there are enough products
            if (topProducts.length > 3) {
                const prevBtn = document.createElement('button');
                prevBtn.classList.add('carousel-nav', 'carousel-prev');
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                
                const nextBtn = document.createElement('button');
                nextBtn.classList.add('carousel-nav', 'carousel-next');
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                
                const carousel = document.querySelector('.product-showcase');
                if (carousel) {
                    carousel.appendChild(prevBtn);
                    carousel.appendChild(nextBtn);
                    
                    // Add scroll functionality
                    prevBtn.addEventListener('click', () => {
                        productCarousel.scrollBy({ left: -600, behavior: 'smooth' });
                    });
                    
                    nextBtn.addEventListener('click', () => {
                        productCarousel.scrollBy({ left: 600, behavior: 'smooth' });
                    });
                }
            }
        } catch (error) {
            console.error('Error loading product carousel:', error);
            
            // Show error message
            const productCarousel = document.getElementById('product-carousel');
            if (productCarousel) {
                productCarousel.innerHTML = '<p class="error">Failed to load product carousel. Please try again later.</p>';
            }
        }
    }

    // Artisan Functions
    async function loadArtisans() {
        const artisanGrid = document.getElementById('artisan-grid');
        
        if (!artisanGrid) return;
        
        try {
            // Get all vendors from database
            const artisans = await dbService.getAllVendors();
            
            // Clear loading message
            artisanGrid.innerHTML = '';
            
            if (artisans.length === 0) {
                artisanGrid.innerHTML = '<p class="no-artisans">No artisans found.</p>';
                return;
            }
            
            // Create artisan cards
            artisans.forEach(artisan => {
                const artisanCard = createArtisanCard(artisan);
                artisanGrid.appendChild(artisanCard);
            });
            
        } catch (error) {
            console.error('Error loading artisans:', error);
            artisanGrid.innerHTML = '<p class="error">Failed to load artisans. Please try again later.</p>';
        }
    }
    
    function createArtisanCard(artisan) {
        const card = document.createElement('div');
        card.className = 'artisan-card';
        
        // Create star rating HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(artisan.rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= artisan.rating) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        // Create specialties HTML
        let specialtiesHtml = '';
        if (artisan.specialties && artisan.specialties.length > 0) {
            artisan.specialties.forEach(specialty => {
                specialtiesHtml += `<span class="specialty-tag">${specialty}</span>`;
            });
        }
        
        card.innerHTML = `
            <div class="artisan-info">
                <h3 class="artisan-name">${artisan.name}</h3>
                <div class="artisan-location">
                    <i class="fas fa-map-marker-alt"></i> ${artisan.location}
                </div>
                <div class="artisan-rating">
                    ${starsHtml}
                    <span>(${artisan.reviewCount || 'undefined'} reviews)</span>
                </div>
                <p class="artisan-description">${artisan.description}</p>
                <div class="artisan-specialties">
                    ${specialtiesHtml}
                </div>
                <button class="view-artisan-btn" data-id="${artisan.id}">View Artisan Products</button>
            </div>
        `;
        
        // Add event listener to view artisan button
        card.querySelector('.view-artisan-btn').addEventListener('click', () => {
            showArtisanProducts(artisan);
        });
        
        // Add event listener to the card to show artisan details modal
        card.querySelector('.artisan-name').addEventListener('click', () => {
            showArtisanDetails(artisan);
        });
        
        return card;
    }
    
    async function showArtisanProducts(artisan) {
        try {
            // Get products by vendor ID
            const products = await dbService.getProductsByVendorId(artisan.id);
            
            // Filter products in the UI to show only this vendor's products
            document.getElementById('category-filter').value = 'all'; // Reset category filter
            
            // Scroll to products section
            document.querySelector('#products').scrollIntoView({ 
                behavior: 'smooth' 
            });
            
            // Update heading to show we're filtering by artisan
            const productsHeading = document.querySelector('#products h2');
            if (productsHeading) {
                productsHeading.innerHTML = `Products by <span class="highlight">${artisan.name}</span>`;
            }
            
            // Display only this vendor's products
            const allProductsContainer = document.getElementById('all-products');
            
            if (!allProductsContainer) return;
            
            // Clear existing products
            allProductsContainer.innerHTML = '';
            
            if (products.length === 0) {
                allProductsContainer.innerHTML = '<p class="no-products">No products found for this artisan.</p>';
                return;
            }
            
            // Display products
            products.forEach(product => {
                const productCard = createProductCard(product);
                allProductsContainer.appendChild(productCard);
            });
            
            // Update pagination
            currentPage = 1;
            totalPages = 1;
            updatePagination();
            
        } catch (error) {
            console.error('Error loading artisan products:', error);
        }
    }
    
    async function showArtisanDetails(artisan) {
        const artisanDetails = document.getElementById('artisan-details');
        const artisanModal = document.getElementById('artisan-modal');
        
        if (!artisanDetails || !artisanModal) return;
        
        try {
            // Get products by vendor ID
            const products = await dbService.getProductsByVendorId(artisan.id);
            
            // Create star rating HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(artisan.rating)) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else if (i - 0.5 <= artisan.rating) {
                    starsHtml += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
            
            // Create specialties HTML
            let specialtiesHtml = '';
            if (artisan.specialties && artisan.specialties.length > 0) {
                artisan.specialties.forEach(specialty => {
                    specialtiesHtml += `<span class="specialty-tag">${specialty}</span>`;
                });
            }
            
            // Create products HTML
            let productsHtml = '';
            if (products.length > 0) {
                productsHtml = `
                    <div class="artisan-details-products">
                        <h3>Featured Products</h3>
                        <div class="mini-product-grid">
                `;
                
                // Show up to 6 products
                const displayProducts = products.slice(0, 6);
                
                displayProducts.forEach(product => {
                    const formattedPrice = '₹' + product.price.toLocaleString('en-IN');
                    productsHtml += `
                        <div class="mini-product-card" data-id="${product.id}">
                            <div class="mini-product-image">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                            <div class="mini-product-info">
                                <h4 class="mini-product-name">${product.name}</h4>
                                <p class="mini-product-price">${formattedPrice}</p>
                            </div>
                        </div>
                    `;
                });
                
                productsHtml += `
                        </div>
                    </div>
                `;
            }
            
            artisanDetails.innerHTML = `
                <div class="artisan-details-header">
                    <div class="artisan-details-image">
                        <img src="${artisan.image}" alt="${artisan.name}">
                    </div>
                    <div class="artisan-details-info">
                        <h2 class="artisan-details-name">${artisan.name}</h2>
                        <div class="artisan-details-location">
                            <i class="fas fa-map-marker-alt"></i> ${artisan.location}
                        </div>
                        <div class="artisan-details-rating">
                            ${starsHtml}
                            <span>(${artisan.reviewCount} reviews)</span>
                        </div>
                        <div class="artisan-details-contact">
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>${artisan.contactEmail}</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>${artisan.contactPhone}</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-calendar"></i>
                                <span>Joined on ${new Date(artisan.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="artisan-details-description">
                    <p>${artisan.description}</p>
                </div>
                
                <div class="artisan-details-specialties">
                    <h3>Specialties</h3>
                    <div class="specialty-tags">
                        ${specialtiesHtml}
                    </div>
                </div>
                
                ${productsHtml}
                
                <div class="artisan-details-actions">
                    <button class="btn-primary view-all-products" data-id="${artisan.id}">View All Products</button>
                </div>
            `;
            
            // Add event listener to view all products button
            artisanDetails.querySelector('.view-all-products').addEventListener('click', () => {
                closeAllModals();
                showArtisanProducts(artisan);
            });
            
            // Add event listeners to mini product cards
            const miniProductCards = artisanDetails.querySelectorAll('.mini-product-card');
            miniProductCards.forEach(card => {
                card.addEventListener('click', async () => {
                    const productId = parseInt(card.getAttribute('data-id'));
                    const product = products.find(p => p.id === productId);
                    
                    if (product) {
                        closeAllModals();
                        showProductDetails(product);
                    }
                });
            });
            
            // Open modal
            openModal(artisanModal);
            
        } catch (error) {
            console.error('Error showing artisan details:', error);
        }
    }
    
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        // Get the appropriate category folder
        let categoryFolder = '';
        switch (product.category) {
            case 'textiles': categoryFolder = 'Textile'; break;
            case 'pottery': categoryFolder = 'Pottery and ceramics'; break;
            case 'jewelry': categoryFolder = 'Traditional Jewellery'; break;
            case 'woodcraft': categoryFolder = 'Wood crafts'; break;
            case 'organic': categoryFolder = 'Organic Products'; break;
            case 'tribal': categoryFolder = 'Tribal Art'; break;
        }
        
        // Create placeholder in case image fails to load
        const placeholderSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">Image not found</text></svg>';
        
        // Ensure image path is correct
        let imagePath = product.image;
        
        // Don't remove spaces from folder names, only from filenames if needed
        const pathParts = imagePath.split('/');
        if (pathParts.length > 2) {
            // Make sure we preserve the folder name with spaces
            const folderName = pathParts[1]; // "images" is at index 0
            const filename = pathParts[pathParts.length - 1];
            
            // Reconstruct the path with proper folder name
            imagePath = `images/${folderName}/${filename}`;
        }
        
        // Format review count or use a default
        const reviewCount = product.reviewCount || Math.floor(Math.random() * 50) + 5;
        
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imagePath}" alt="${product.name}" class="product-image" loading="lazy" 
                     onerror="this.onerror=null; this.src='${placeholderSrc}'; console.log('Using placeholder for: ${product.name}');">
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                <div class="product-rating">
                    ${getRatingStars(product.rating)}
                    <span>(${reviewCount})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="view-details" data-id="${product.id}">Details</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const viewDetailsBtn = card.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                showProductDetails(product);
            });
        }
        
        const addToCartBtn = card.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                addToCart(product);
            });
        }
        
        card.addEventListener('click', () => {
            showProductDetails(product);
        });
        
        return card;
    }
    
    function filterProducts() {
        // Reset page to 1 when filtering
        currentPage = 1;
        
        // Get filter values
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const sortBy = document.getElementById('sort-by');
        
        const categoryValue = categoryFilter ? categoryFilter.value : 'all';
        const priceValue = priceFilter ? priceFilter.value : 'all';
        const sortValue = sortBy ? sortBy.value : 'newest';
        
        console.log('Filter values:', { categoryValue, priceValue, sortValue });
        console.log('All products before filtering:', window.allProducts);
        
        // Apply filters to products
        let filteredProducts = window.allProducts ? [...window.allProducts] : [];
        console.log('Initial filtered products count:', filteredProducts.length);
        
        // Apply category filter
        if (categoryValue !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === categoryValue);
            console.log('After category filter:', filteredProducts.length);
        }
        
        // Apply price filter
        if (priceValue !== 'all') {
            const [min, max] = priceValue.split('-');
            if (max) {
                filteredProducts = filteredProducts.filter(product => product.price >= parseInt(min) && product.price <= parseInt(max));
            } else {
                // For "5000+" case
                filteredProducts = filteredProducts.filter(product => product.price >= parseInt(min));
            }
            console.log('After price filter:', filteredProducts.length);
        }
        
        // Apply sorting
        switch (sortValue) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
            default:
                filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
        }
        
        // Update current products and UI
        currentProducts = filteredProducts;
        console.log('Final filtered products count:', currentProducts.length);
        
        // Update UI with filtered products
        updateProductsUI();
        updatePagination();
    }
    
    async function filterProductsData(searchTerm) {
        let products;
        
        try {
            // Get all products from database
            products = await dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Apply search filter if provided
            if (searchTerm) {
                products = products.filter(p => 
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // Get filter elements
            const categoryFilter = document.getElementById('category-filter');
            const priceFilter = document.getElementById('price-filter');
            const sortBy = document.getElementById('sort-by');
            
            // Apply category filter
            const category = categoryFilter ? categoryFilter.value : 'all';
            if (category !== 'all') {
                products = products.filter(p => p.category === category);
            }
            
            // Apply price filter
            const price = priceFilter ? priceFilter.value : 'all';
            if (price !== 'all') {
                const [min, max] = price.split('-');
                if (max) {
                    products = products.filter(p => p.price >= Number(min) && p.price <= Number(max));
                } else {
                    products = products.filter(p => p.price >= Number(min));
                }
            }
            
            // Apply sorting
            const sort = sortBy ? sortBy.value : 'newest';
            switch (sort) {
                case 'price-low':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'popular':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                default:
                    products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                    break;
            }
            
            return products;
        } catch (error) {
            console.error('Error filtering products:', error);
            return [];
        }
    }
    
    function updatePagination() {
        if (!pageIndicator) return;
        
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage === 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage === totalPages;
        }
    }
    
    function showProductDetails(product) {
        // Open product modal
        const productModal = document.getElementById('product-modal');
        const productDetails = document.getElementById('product-details');
        
        if (!productModal || !productDetails) return;
        
        // Create star rating HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(product.rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= product.rating) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        // Format the price with Indian Rupee format
        const formattedPrice = '₹' + product.price.toLocaleString('en-IN');
        
        // Normalize and fix image path
        let imagePath = normalizeImagePath(product.image);
        
        // Fix filename spaces but preserve folder name spaces
        const pathParts = imagePath.split('/');
        if (pathParts.length > 0) {
            const filename = pathParts[pathParts.length - 1];
            if (filename && filename.includes(' ')) {
                pathParts[pathParts.length - 1] = filename.replace(/\s+/g, '');
                imagePath = pathParts.join('/');
                
                // Update the product in the database with the fixed path
                setTimeout(() => {
                    product.image = imagePath;
                    window.dbService.update(OBJECT_STORES.PRODUCTS, product)
                        .then(() => console.log(`Updated product ${product.id} with fixed image path: ${imagePath}`))
                        .catch(err => console.error(`Error updating product image path: ${err}`));
                }, 0);
            }
        }
        
        // Get category folder name for placeholder
        const categoryFolderMap = {
            'textiles': 'Textile',
            'pottery': 'Pottery and ceramics',
            'jewelry': 'Traditional Jewellery',
            'organic': 'Organic Products',
            'tribal': 'Tribal Art',
            'woodcraft': 'Wood crafts'
        };
        
        const categoryFolder = categoryFolderMap[product.category] || product.category;
        const placeholderSrc = window.placeholders && window.placeholders[categoryFolder] 
            ? window.placeholders[categoryFolder] 
            : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">Image not found</text></svg>';
        
        productDetails.innerHTML = `
            <div class="product-details-image">
                <img src="${imagePath}" alt="${product.name}" 
                     loading="lazy"
                     onerror="this.onerror=null; this.src='${placeholderSrc}'; console.log('Using placeholder for: ${product.name}');">
            </div>
            <div class="product-details-info">
                <div class="product-details-category">${product.category}</div>
                <h2 class="product-details-title">${product.name}</h2>
                <div class="product-details-price">${formattedPrice}</div>
                <div class="product-details-rating">
                    ${starsHtml}
                    <span>(${product.reviewCount} reviews)</span>
                </div>
                <div class="product-details-description">
                    ${product.description}
                </div>
                <div class="product-details-meta">
                    <div class="meta-item">
                        <span class="meta-label">Availability:</span>
                        <span>${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Vendor:</span>
                        <span>${product.vendor}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">SKU:</span>
                        <span>${product.sku}</span>
                    </div>
                </div>
                <div class="quantity-selector">
                    <button class="quantity-decrease">-</button>
                    <input type="number" value="1" min="1" max="${product.stock}" id="product-quantity">
                    <button class="quantity-increase">+</button>
                </div>
                <div class="product-details-actions">
                    <button class="add-to-cart-details" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const quantityInput = productDetails.querySelector('#product-quantity');
        
        productDetails.querySelector('.quantity-decrease').addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value = Number(quantityInput.value) - 1;
            }
        });
        
        productDetails.querySelector('.quantity-increase').addEventListener('click', () => {
            if (quantityInput.value < product.stock) {
                quantityInput.value = Number(quantityInput.value) + 1;
            }
        });
        
        productDetails.querySelector('.add-to-cart-details').addEventListener('click', () => {
            const quantity = Number(quantityInput.value);
            addToCart(product, quantity);
            closeAllModals();
        });
        
        // Open modal
        openModal(productModal);
    }
    
    // Cart Functions
    function addToCart(product, quantity = 1) {
        // Get cart from localStorage
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
        
        if (!Array.isArray(cart)) {
            cart = [];
        }
        
        // Add category information to help with image fallbacks
        const category = product.category || '';
        
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: category,
                quantity: quantity
            });
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        updateCartUI();
        
        // Show feedback
        alert(`${product.name} added to cart!`);
    }
    
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        
        if (!cartCount) {
            console.error('Cart count element not found');
            return;
        }
        
        // Get cart from localStorage
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        if (!Array.isArray(cart)) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    function updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartShipping = document.getElementById('cart-shipping');
        const cartTotal = document.getElementById('cart-total');
        const cartModal = document.getElementById('cart-modal');
        
        if (!cartItems) {
            console.error('Cart items container not found');
            return;
        }
        
        // Clear existing items
        cartItems.innerHTML = '';
        
        // Get cart from localStorage
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        if (!Array.isArray(cart) || cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartSubtotal) cartSubtotal.textContent = '₹0.00';
            if (cartShipping) cartShipping.textContent = '₹0.00';
            if (cartTotal) cartTotal.textContent = '₹0.00';
            return;
        }
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 10 : 0; // Flat shipping rate
        const total = subtotal + shipping;
        
        // Update summary
        if (cartSubtotal) cartSubtotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
        if (cartShipping) cartShipping.textContent = '₹' + shipping.toLocaleString('en-IN');
        if (cartTotal) cartTotal.textContent = '₹' + total.toLocaleString('en-IN');
        
        // Render cart items
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const formattedPrice = '₹' + item.price.toLocaleString('en-IN');
            
            // Create a fallback image path in case the original doesn't load
            const fallbackImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">Image not found</text></svg>';
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">${formattedPrice}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Add event listeners after all items are added to the DOM
        document.querySelectorAll('.quantity-decrease').forEach(btn => {
            btn.onclick = function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateCartItemQuantity(itemId, -1);
            };
        });
        
        document.querySelectorAll('.quantity-increase').forEach(btn => {
            btn.onclick = function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateCartItemQuantity(itemId, 1);
            };
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.onclick = function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId);
            };
        });
    }
    
    function updateCartItemQuantity(itemId, change) {
        // Get cart from localStorage
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
        
        if (!Array.isArray(cart)) {
            cart = [];
        }
        
        const item = cart.find(item => item.id === itemId);
        
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            // Save updated cart back to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartUI();
        }
    }
    
    function removeFromCart(itemId) {
        // Get cart from localStorage
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
        
        if (!Array.isArray(cart)) {
            cart = [];
        }
        
        // Filter out the item to remove
        cart = cart.filter(item => item.id !== itemId);
        
        // Save updated cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        updateCartUI();
    }
    
    // User Data Functions
    function loadUserData() {
        // This would typically be an API call to fetch user data
        // For demo purposes, we'll use mock data
        const vendorProducts = document.getElementById('vendor-products');
        
        if (!vendorProducts) return;
        
        // Clear existing content
        vendorProducts.innerHTML = '';
        
        // Render vendor products
        mockVendorProducts.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'vendor-product-item';
            
            const formattedPrice = '₹' + product.price.toLocaleString('en-IN');
            
            productItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="vendor-product-image">
                <div class="vendor-product-details">
                    <h3>${product.name}</h3>
                    <p>Price: ${formattedPrice}</p>
                    <p>Stock: ${product.stock}</p>
                    <p>Status: ${product.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div class="vendor-product-actions">
                    <button class="btn-secondary">Edit</button>
                    <button class="btn-secondary">Delete</button>
                </div>
            `;
            
            vendorProducts.appendChild(productItem);
        });
    }

    // Helper functions for product display
    function getCategoryName(category) {
        const categoryMap = {
            'textiles': 'Handloom Textiles',
            'pottery': 'Pottery & Ceramics',
            'jewelry': 'Traditional Jewelry',
            'woodcraft': 'Wood Crafts',
            'organic': 'Organic Products',
            'tribal': 'Tribal Art'
        };
        return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    function getRatingStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        return starsHtml;
    }

    // Function to filter products with valid images
    async function filterValidProducts(products) {
        if (!products || products.length === 0) return [];
        
        console.log(`Validating images for ${products.length} products...`);
        
        const validProducts = [];
        for (const product of products) {
            if (product.image) {
                // Try to validate the image exists
                const isValid = await validateImageExists(product.image);
                if (isValid) {
                    validProducts.push(product);
                } else {
                    console.log(`Attempting to fix invalid image: ${product.name} (${product.image})`);
                    
                    // Try to extract category and filename
                    const categories = [
                        'Textile',
                        'Pottery and ceramics',
                        'Traditional Jewellery',
                        'Organic Products',
                        'Tribal Art',
                        'Wood crafts'
                    ];
                    
                    // Find which category this product belongs to
                    let category = null;
                    for (const cat of categories) {
                        if (product.image.includes(`images/${cat}/`)) {
                            category = cat;
                            break;
                        }
                    }
                    
                    if (category) {
                        // Extract filename and try different extensions
                        const filename = product.image.split('/').pop();
                        const baseFilename = filename.replace(/\.[^/.]+$/, '');
                        const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
                        
                        let fixed = false;
                        for (const ext of extensions) {
                            const newPath = `images/${category}/${baseFilename}${ext}`;
                            if (await checkImage(newPath)) {
                                console.log(`Fixed image path: ${newPath}`);
                                product.image = newPath;
                                validProducts.push(product);
                                fixed = true;
                                break;
                            }
                        }
                        
                        // If still not fixed, try without spaces
                        if (!fixed) {
                            const cleanFilename = baseFilename.replace(/\s+/g, '');
                            for (const ext of extensions) {
                                const newPath = `images/${category}/${cleanFilename}${ext}`;
                                if (await checkImage(newPath)) {
                                    console.log(`Fixed image path (removed spaces): ${newPath}`);
                                    product.image = newPath;
                                    validProducts.push(product);
                                    fixed = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!fixed) {
                            console.log(`Could not fix image for product: ${product.name}`);
                        }
                    }
                }
            }
        }
        
        console.log(`Found ${validProducts.length} products with valid images`);
        return validProducts;
    }

    // Function to update product database with correct image paths
    async function updateProductDatabase() {
        try {
            console.log('Updating product database with correct image paths...');
            
            // Get all products from database
            const products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Define the categories based on folder structure
            const categories = [
                'Textile',
                'Pottery and ceramics',
                'Traditional Jewellery',
                'Organic Products',
                'Tribal Art',
                'Wood crafts'
            ];
            
            // Map category names to database category values
            const categoryMap = {
                'Textile': 'textiles',
                'Pottery and ceramics': 'pottery',
                'Traditional Jewellery': 'jewelry',
                'Organic Products': 'organic',
                'Tribal Art': 'tribal',
                'Wood crafts': 'woodcraft'
            };
            
            // Process each product
            for (const product of products) {
                // Skip products without images
                if (!product.image) continue;
                
                // Extract category from image path
                let imageCategory = null;
                for (const cat of categories) {
                    if (product.image.includes(`images/${cat}/`)) {
                        imageCategory = cat;
                        break;
                    }
                }
                
                // If category found in image path, ensure product.category matches
                if (imageCategory && categoryMap[imageCategory]) {
                    const expectedCategory = categoryMap[imageCategory];
                    if (product.category !== expectedCategory) {
                        console.log(`Updating product ${product.id} category from ${product.category} to ${expectedCategory}`);
                        product.category = expectedCategory;
                        await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                    }
                }
                
                // First normalize the path
                const normalizedPath = normalizeImagePath(product.image);
                if (normalizedPath !== product.image) {
                    console.log(`Normalized path for product ${product.id}: ${normalizedPath}`);
                    product.image = normalizedPath;
                    await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                }
                
                // Check if image exists
                const imageExists = await checkImage(product.image);
                if (!imageExists) {
                    console.log(`Image not found for product ${product.id}: ${product.image}`);
                    
                    // Try to find a matching image
                    if (imageCategory) {
                        const pathParts = product.image.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        const baseFilename = filename.replace(/\.[^/.]+$/, '');
                        const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
                        
                        let found = false;
                        // Try with original filename but different extensions
                        for (const ext of extensions) {
                            const newPath = `images/${imageCategory}/${baseFilename}${ext}`;
                            if (await checkImage(newPath)) {
                                console.log(`Found image with different extension: ${newPath}`);
                                product.image = newPath;
                                await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                                found = true;
                                break;
                            }
                        }
                        
                        // If still not found, try without spaces in filename only
                        if (!found && baseFilename.includes(' ')) {
                            const cleanFilename = baseFilename.replace(/\s+/g, '');
                            for (const ext of extensions) {
                                const newPath = `images/${imageCategory}/${cleanFilename}${ext}`;
                                if (await checkImage(newPath)) {
                                    console.log(`Found image with spaces removed from filename: ${newPath}`);
                                    product.image = newPath;
                                    await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                                    found = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!found) {
                            console.log(`Could not find a matching image for product ${product.id}`);
                        }
                    }
                }
            }
            
            // Update product prices
            await updateProductPrices();
            
            console.log('Finished updating product database');
        } catch (error) {
            console.error('Error updating product database:', error);
        }
    }
    
    // Function to update product prices based on category
    async function updateProductPrices() {
        try {
            console.log('Updating product prices...');
            
            // Get all products from database
            const products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Update each product
            for (const product of products) {
                // Update price based on category
                if (product.category) {
                    let updated = false;
                    
                    // Update price based on category
                    switch (product.category) {
                        case 'textiles':
                            // Handloom Textiles (1000-3000)
                            product.price = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
                            updated = true;
                            break;
                        case 'pottery':
                            // Pottery & Ceramics (500-1000)
                            product.price = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
                            updated = true;
                            break;
                        case 'jewelry':
                            // Traditional Jewelry (1500-3000)
                            product.price = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500;
                            updated = true;
                            break;
                        case 'woodcraft':
                            // Wood Crafts (400-800)
                            product.price = Math.floor(Math.random() * (800 - 400 + 1)) + 400;
                            updated = true;
                            break;
                        case 'organic':
                            // Organic Products (400-1000)
                            product.price = Math.floor(Math.random() * (1000 - 400 + 1)) + 400;
                            updated = true;
                            break;
                        case 'tribal':
                            // Tribal Art (800-1200)
                            product.price = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
                            updated = true;
                            break;
                    }
                    
                    // Update product in database if changed
                    if (updated) {
                        await window.dbService.update(OBJECT_STORES.PRODUCTS, product);
                    }
                }
            }
            
            console.log('Product prices updated successfully');
        } catch (error) {
            console.error('Error updating product prices:', error);
        }
    }
});

