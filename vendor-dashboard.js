// Vendor Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    setupTabs();
    
    // Form handling
    setupForms();
    
    // Load initial data
    loadDashboardData();
    
    // Set initial active navigation link
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        const navLink = document.querySelector(`.nav-tab-link[data-tab="${tabId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
    }
    
    // Setup logout button
    setupLogoutButton();
});

/**
 * Set up tab switching functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const navTabLinks = document.querySelectorAll('.nav-tab-link');
    
    // Function to switch tabs
    function switchTab(tabId) {
        // Remove active class from all buttons and tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        navTabLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current button and tab
        const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Add active class to navigation link
        const activeNavLink = document.querySelector(`.nav-tab-link[data-tab="${tabId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        const tabContent = document.getElementById(`${tabId}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    }
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Add click event to navigation links
    navTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Handle "Add Product" button in products tab
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            // Find and click the add-product tab button
            const addProductTabBtn = document.querySelector('.tab-btn[data-tab="add-product"]');
            if (addProductTabBtn) {
                addProductTabBtn.click();
            }
        });
    }
}

/**
 * Set up form handling
 */
function setupForms() {
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const productName = document.getElementById('product-name').value;
            const productCategory = document.getElementById('product-category').value;
            const productPrice = document.getElementById('product-price').value;
            const productStock = document.getElementById('product-stock').value;
            const productDescription = document.getElementById('product-description').value;
            
            // Validate form data
            if (!productName || !productCategory || !productPrice || !productStock || !productDescription) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Simulate product addition
            alert(`Product "${productName}" added successfully!`);
            
            // Reset form
            addProductForm.reset();
            
            // Switch back to products tab
            const productsTabBtn = document.querySelector('.tab-btn[data-tab="products"]');
            if (productsTabBtn) {
                productsTabBtn.click();
            }
        });
    }
    
    // Image preview functionality
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (productImageInput && imagePreview) {
        productImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Product Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '<p>No image selected</p>';
            }
        });
    }
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
    // Load summary data
    document.getElementById('total-products').textContent = '24';
    document.getElementById('pending-orders').textContent = '8';
    document.getElementById('total-sales').textContent = '₹45,600';
    document.getElementById('avg-rating').textContent = '4.7';
    
    // Load products
    loadProducts();
    
    // Load orders
    loadOrders();
    
    // Initialize charts
    initializeCharts();
}

/**
 * Load product data
 */
function loadProducts() {
    const productTableBody = document.getElementById('product-table-body');
    if (!productTableBody) return;
    
    // Clear loading indicator
    productTableBody.innerHTML = '';
    
    // Sample product data
    const products = [
        {
            id: 1,
            name: 'Handwoven Silk Scarf',
            category: 'textiles',
            price: 1200,
            stock: 15,
            status: 'active',
            image: 'images/Textile/handwoven-silk-scarf.jpg'
        },
        {
            id: 2,
            name: 'Clay Water Pot',
            category: 'pottery',
            price: 450,
            stock: 8,
            status: 'active',
            image: 'images/Pottery/clay-water-pot.jpg'
        },
        {
            id: 3,
            name: 'Wooden Elephant Figurine',
            category: 'woodcraft',
            price: 850,
            stock: 0,
            status: 'out-of-stock',
            image: 'images/Woodcraft/wooden-elephant.jpg'
        },
        {
            id: 4,
            name: 'Silver Anklet',
            category: 'jewelry',
            price: 1500,
            stock: 5,
            status: 'active',
            image: 'images/Jewelry/silver-anklet.jpg'
        },
        {
            id: 5,
            name: 'Organic Honey',
            category: 'organic',
            price: 350,
            stock: 20,
            status: 'active',
            image: 'images/Organic/organic-honey.jpg'
        }
    ];
    
    // Add products to table
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Format category name
        const categoryName = getCategoryName(product.category);
        
        // Format status class
        const statusClass = `status-${product.status}`;
        
        row.innerHTML = `
            <td class="product-image-cell">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
            </td>
            <td>${product.name}</td>
            <td>${categoryName}</td>
            <td>₹${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td><span class="product-status ${statusClass}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</span></td>
            <td class="product-actions-cell">
                <button class="action-btn edit" data-id="${product.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${product.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn.edit').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            alert(`Edit product with ID: ${productId}`);
            // In a real app, this would open an edit form or modal
        });
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete this product?`)) {
                alert(`Product with ID: ${productId} deleted`);
                // In a real app, this would delete the product and refresh the list
            }
        });
    });
}

/**
 * Load order data
 */
function loadOrders() {
    const orderTableBody = document.getElementById('order-table-body');
    if (!orderTableBody) return;
    
    // Clear loading indicator
    orderTableBody.innerHTML = '';
    
    // Sample order data
    const orders = [
        {
            id: 'ORD-2023-1001',
            customer: 'Rahul Sharma',
            date: '2023-10-15',
            total: 2450,
            status: 'pending',
            items: 2
        },
        {
            id: 'ORD-2023-0998',
            customer: 'Priya Patel',
            date: '2023-10-14',
            total: 850,
            status: 'processing',
            items: 1
        },
        {
            id: 'ORD-2023-0982',
            customer: 'Amit Kumar',
            date: '2023-10-10',
            total: 3200,
            status: 'shipped',
            items: 3
        },
        {
            id: 'ORD-2023-0975',
            customer: 'Neha Singh',
            date: '2023-10-08',
            total: 1750,
            status: 'delivered',
            items: 2
        },
        {
            id: 'ORD-2023-0950',
            customer: 'Vikram Mehta',
            date: '2023-10-01',
            total: 500,
            status: 'cancelled',
            items: 1
        }
    ];
    
    // Add orders to table
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Format status class
        const statusClass = `status-${order.status}`;
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.items} item${order.items > 1 ? 's' : ''}</td>
            <td>₹${order.total.toLocaleString()}</td>
            <td>${formattedDate}</td>
            <td><span class="order-status ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
            <td>
                <button class="view-btn" data-id="${order.id}">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        
        orderTableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            alert(`View order details for order ID: ${orderId}`);
            // In a real app, this would open an order details modal
        });
    });
}

/**
 * Get formatted category name
 */
function getCategoryName(category) {
    const categories = {
        'textiles': 'Handloom Textiles',
        'pottery': 'Pottery & Ceramics',
        'jewelry': 'Traditional Jewelry',
        'woodcraft': 'Wood Crafts',
        'organic': 'Organic Products',
        'tribal': 'Tribal Art'
    };
    
    return categories[category] || category;
}

/**
 * Initialize all charts for analytics tab
 */
function initializeCharts() {
    // Initialize sales chart
    initSalesChart();
    
    // Initialize top products chart
    initProductsChart();
    
    // Initialize demographics chart
    initDemographicsChart();
    
    // Initialize order status chart
    initOrderStatusChart();
    
    // Set up date range filter
    const dateRangeSelect = document.getElementById('date-range');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', () => {
            // Update all charts based on selected date range
            initSalesChart(dateRangeSelect.value);
            initProductsChart(dateRangeSelect.value);
            initDemographicsChart(dateRangeSelect.value);
            initOrderStatusChart(dateRangeSelect.value);
        });
    }
}

/**
 * Initialize sales chart
 */
function initSalesChart(dateRange = '30days') {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;
    
    // Sample data based on date range
    const data = getSalesData(dateRange);
    
    // Create chart
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sales (₹)',
                data: data.values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize top products chart
 */
function initProductsChart(dateRange = '30days') {
    const ctx = document.getElementById('products-chart');
    if (!ctx) return;
    
    // Sample data based on date range
    const data = getTopProductsData(dateRange);
    
    // Create chart
    if (window.productsChart) {
        window.productsChart.destroy();
    }
    
    window.productsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Units Sold',
                data: data.values,
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(156, 39, 176, 0.7)',
                    'rgba(233, 30, 99, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize demographics chart
 */
function initDemographicsChart(dateRange = '30days') {
    const ctx = document.getElementById('demographics-chart');
    if (!ctx) return;
    
    // Sample data based on date range
    const data = getDemographicsData(dateRange);
    
    // Create chart
    if (window.demographicsChart) {
        window.demographicsChart.destroy();
    }
    
    window.demographicsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(156, 39, 176, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Initialize order status chart
 */
function initOrderStatusChart(dateRange = '30days') {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;
    
    // Sample data based on date range
    const data = getOrderStatusData(dateRange);
    
    // Create chart
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    window.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    'rgba(255, 152, 0, 0.7)',  // Pending
                    'rgba(33, 150, 243, 0.7)',  // Processing
                    'rgba(76, 175, 80, 0.7)',   // Delivered
                    'rgba(244, 67, 54, 0.7)'    // Cancelled
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Get sales data based on date range
 */
function getSalesData(dateRange) {
    // Sample data for different date ranges
    const data = {
        '7days': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [1200, 1900, 800, 1700, 2100, 2800, 2200]
        },
        '30days': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            values: [8700, 10200, 9500, 12600]
        },
        '90days': {
            labels: ['Jan', 'Feb', 'Mar'],
            values: [28000, 32500, 41000]
        },
        'year': {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: [28000, 32500, 41000, 38500, 42000, 46500, 39000, 35000, 43000, 48000, 51000, 55000]
        }
    };
    
    return data[dateRange] || data['30days'];
}

/**
 * Get top products data based on date range
 */
function getTopProductsData(dateRange) {
    // Sample data for different date ranges
    const data = {
        '7days': {
            labels: ['Handwoven Silk Scarf', 'Clay Water Pot', 'Silver Anklet', 'Wooden Figurine', 'Organic Honey'],
            values: [12, 8, 6, 5, 4]
        },
        '30days': {
            labels: ['Handwoven Silk Scarf', 'Silver Anklet', 'Clay Water Pot', 'Organic Honey', 'Wooden Figurine'],
            values: [42, 35, 28, 22, 18]
        },
        '90days': {
            labels: ['Silver Anklet', 'Handwoven Silk Scarf', 'Clay Water Pot', 'Wooden Figurine', 'Organic Honey'],
            values: [120, 105, 95, 80, 75]
        },
        'year': {
            labels: ['Handwoven Silk Scarf', 'Silver Anklet', 'Clay Water Pot', 'Wooden Figurine', 'Organic Honey'],
            values: [450, 380, 320, 280, 250]
        }
    };
    
    return data[dateRange] || data['30days'];
}

/**
 * Get demographics data based on date range
 */
function getDemographicsData(dateRange) {
    // Sample data for different date ranges (consistent across ranges for simplicity)
    const data = {
        labels: ['Urban', 'Suburban', 'Rural', 'International'],
        values: [45, 30, 15, 10]
    };
    
    return data;
}

/**
 * Get order status data based on date range
 */
function getOrderStatusData(dateRange) {
    // Sample data for different date ranges
    const data = {
        '7days': {
            labels: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
            values: [8, 12, 25, 2]
        },
        '30days': {
            labels: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
            values: [15, 28, 95, 8]
        },
        '90days': {
            labels: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
            values: [25, 45, 280, 22]
        },
        'year': {
            labels: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
            values: [45, 120, 950, 85]
        }
    };
    
    return data[dateRange] || data['30days'];
}

/**
 * Set up logout button functionality
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // In a real application, you would also clear session data, tokens, etc.
            // For now, we'll just redirect to the home page
            window.location.href = 'index.html';
        });
    }
} 