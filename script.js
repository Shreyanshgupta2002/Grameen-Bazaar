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
    } catch (error) {
        console.error('Error initializing database:', error);
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
    
    // Filter and Sort Products
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', filterProducts);
    }
    
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadProducts();
                updatePagination();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadProducts();
                updatePagination();
            }
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
            // Get filter values
            const categoryValue = categoryFilter.value;
            const priceValue = priceFilter.value;
            const sortValue = sortBy.value;
            
            // Get all products
            let products = await window.dbService.getAll(OBJECT_STORES.PRODUCTS);
            
            // Filter products with valid images
            products = await filterValidProducts(products);
            
            // Apply category filter
            if (categoryValue !== 'all') {
                products = products.filter(product => product.category === categoryValue);
            }
            
            // Apply price filter
            if (priceValue !== 'all') {
                const [min, max] = priceValue.split('-');
                if (max) {
                    products = products.filter(product => product.price >= parseInt(min) && product.price <= parseInt(max));
                } else {
                    // For "5000+" case
                    products = products.filter(product => product.price >= parseInt(min));
                }
            }
            
            // Apply sorting
            switch (sortValue) {
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
            
            // Update global products array and current page
            window.allProducts = products;
            window.currentPage = 1;
            window.productsPerPage = 12;
            
            // Update UI
            updateProductsUI();
            updatePagination();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
    
    async function loadFeaturedProducts() {
        try {
            const featuredProductsContainer = document.getElementById('featured-products');
            if (!featuredProductsContainer) return;
            
            // Clear loading spinner
            featuredProductsContainer.innerHTML = '';
            
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
        }
    }

    // Load Product Carousel
    async function loadProductCarousel() {
        try {
            const productCarousel = document.getElementById('product-carousel');
            if (!productCarousel) return;
            
            // Clear loading spinner
            productCarousel.innerHTML = '';
            
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
        } catch (error) {
            console.error('Error loading product carousel:', error);
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
        const placeholderSrc = window.placeholders && window.placeholders[categoryFolder] ? 
            window.placeholders[categoryFolder] : 
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" fill="%23999">Image not found</text></svg>';
        
        // Fix and normalize image path if needed
        let imagePath = normalizeImagePath(product.image);
        
        // Don't remove spaces from folder names, only from filenames if needed
        const pathParts = imagePath.split('/');
        if (pathParts.length > 0) {
            const filename = pathParts[pathParts.length - 1];
            if (filename && filename.includes(' ')) {
                const cleanFilename = filename.replace(/\s+/g, '');
                pathParts[pathParts.length - 1] = cleanFilename;
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
                    <span>(${product.reviewCount})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="view-details" data-id="${product.id}">Details</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-details').addEventListener('click', () => {
            showProductDetails(product);
        });
        
        card.querySelector('.add-to-cart').addEventListener('click', (event) => {
            event.stopPropagation();
            addToCart(product);
        });
        
        card.addEventListener('click', () => {
            showProductDetails(product);
        });
        
        return card;
    }
    
    function filterProducts(searchTerm) {
        // Reset page to 1 when filtering
        currentPage = 1;
        loadProducts();
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
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        updateCartCount();
        updateCartUI();
        
        // Show feedback
        alert(`${product.name} added to cart!`);
    }
    
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        
        if (!cartCount) return;
        
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    function updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartShipping = document.getElementById('cart-shipping');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems) return;
        
        // Clear existing items
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
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
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
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
            
            // Add event listeners
            cartItem.querySelector('.quantity-decrease').addEventListener('click', () => {
                updateCartItemQuantity(item.id, -1);
            });
            
            cartItem.querySelector('.quantity-increase').addEventListener('click', () => {
                updateCartItemQuantity(item.id, 1);
            });
            
            cartItem.querySelector('.cart-item-remove').addEventListener('click', () => {
                removeFromCart(item.id);
            });
            
            cartItems.appendChild(cartItem);
        });
    }
    
    function updateCartItemQuantity(itemId, change) {
        const item = cart.find(item => item.id === itemId);
        
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartCount();
            updateCartUI();
        }
    }
    
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
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
            
            // Get all products
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
                'Tribal Art': 'art',
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
            
            console.log('Finished updating product database');
        } catch (error) {
            console.error('Error updating product database:', error);
        }
    }
});

