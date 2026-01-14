/* ===================================
   PRICE COMPARISON APP - JAVASCRIPT
   Modern ES6+ Implementation
   =================================== */

'use strict';

/* ===================================
   ERROR HANDLING WRAPPER
   =================================== */

/**
 * Global error handler wrapper for functions
 * @param {Function} fn - Function to wrap with error handling
 * @param {string} context - Context description for error logging
 * @returns {Function} Wrapped function with error handling
 */
const withErrorHandling = (fn, context = 'Operation') => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`[Error in ${context}]:`, error);
            showNotification(`An error occurred: ${error.message}`, 'error');
            return null;
        }
    };
};

/**
 * Safe function executor
 * @param {Function} fn - Function to execute safely
 * @param {*} fallback - Fallback value if function fails
 * @returns {*} Result of function or fallback value
 */
const safeExecute = (fn, fallback = null) => {
    try {
        return fn();
    } catch (error) {
        console.error('Safe execute caught error:', error);
        return fallback;
    }
};

/* ===================================
   LOCAL STORAGE UTILITY FUNCTIONS
   =================================== */

/**
 * LocalStorage utility object with comprehensive methods
 */
const storage = {
    /**
     * Set item in localStorage with JSON serialization
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    set: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Failed to save to localStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Get item from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed value or default
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Failed to read from localStorage (${key}):`, error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key to remove
     * @returns {boolean} Success status
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove from localStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Clear all items from localStorage
     * @returns {boolean} Success status
     */
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    },

    /**
     * Check if key exists in localStorage
     * @param {string} key - Storage key to check
     * @returns {boolean} Existence status
     */
    has: (key) => {
        return localStorage.getItem(key) !== null;
    },

    /**
     * Get all keys from localStorage
     * @returns {Array<string>} Array of all storage keys
     */
    keys: () => {
        return Object.keys(localStorage);
    }
};

/* ===================================
   API CONFIGURATION
   =================================== */

/**
 * API Keys Configuration - ALL 3 APIS CONFIGURED!
 */
const API_KEYS = {
    // RapidAPI Key for all services
    rapidapi: '0cea22048cmsh63d524e214841a4p192054jsn726d62816f8b',
    
    // Amazon Real-Time Data API
    amazon: {
        host: 'real-time-amazon-data.p.rapidapi.com'
    },
    
    // AliExpress DataHub API
    aliexpress: {
        host: 'aliexpress-datahub.p.rapidapi.com'
    },
    
    // Walmart Data API
    walmart: {
        host: 'walmart-data.p.rapidapi.com'
    }
};

/**
 * Check if APIs are configured
 */
const areAPIsConfigured = () => {
    return API_KEYS.rapidapi && API_KEYS.rapidapi !== '';
};

/* ===================================
   API FUNCTIONS - REAL E-COMMERCE APIS
   =================================== */

/**
 * Fetch products from Amazon Real-Time Data API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of products from Amazon
 */
const fetchFromAmazon = async (query) => {
    try {
        const url = `https://${API_KEYS.amazon.host}/search?query=${encodeURIComponent(query)}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEYS.rapidapi,
                'x-rapidapi-host': API_KEYS.amazon.host
            }
        });
        
        if (!response.ok) throw new Error(`Amazon API error: ${response.status}`);
        
        const data = await response.json();
        const products = data.data?.products || [];
        
        return products.slice(0, 10).map((product, index) => ({
            id: `amazon_${product.asin || index}`,
            name: product.product_title || 'Unknown Product',
            description: product.product_title || '',
            category: 'electronics',
            image: product.product_photo || product.product_main_image_url || '',
            thumbnail: product.product_thumbnail || product.product_photo || '',
            rating: parseFloat(product.product_star_rating || 4.2),
            popularity: parseInt(product.product_num_ratings || 100),
            reviews: parseInt(product.product_num_ratings || 0),
            prices: [{
                retailer: 'Amazon',
                price: parseFloat((product.product_price || product.product_original_price || '0').replace(/[$,]/g, '')),
                inStock: product.product_availability !== 'OUT_OF_STOCK',
                shipping: product.delivery || 'Standard shipping',
                url: product.product_url || `https://www.amazon.com/dp/${product.asin}`
            }]
        }));
    } catch (error) {
        console.error('❌ Amazon API Error:', error);
        return [];
    }
};

/**
 * Fetch products from Walmart Data API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of products from Walmart
 */
const fetchFromWalmart = async (query) => {
    try {
        const url = `https://${API_KEYS.walmart.host}/walmart-search.php?query=${encodeURIComponent(query)}&page=1&sort=best_match`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEYS.rapidapi,
                'x-rapidapi-host': API_KEYS.walmart.host
            }
        });
        
        if (!response.ok) throw new Error(`Walmart API error: ${response.status}`);
        
        const data = await response.json();
        const products = data.data?.results || data.results || [];
        
        return products.slice(0, 10).map((product, index) => ({
            id: `walmart_${product.id || product.usItemId || index}`,
            name: product.name || product.title || 'Unknown Product',
            description: product.shortDescription || product.name || '',
            category: product.category || 'general',
            image: product.image || product.imageUrl || product.thumbnailUrl || '',
            thumbnail: product.thumbnailUrl || product.image || '',
            rating: parseFloat(product.rating || product.averageRating || 4.0),
            popularity: parseInt(product.numberOfReviews || product.reviewCount || 50),
            reviews: parseInt(product.numberOfReviews || 0),
            prices: [{
                retailer: 'Walmart',
                price: parseFloat(product.price || product.currentPrice || product.priceInfo?.currentPrice?.price || 0),
                inStock: product.availabilityStatus !== 'OUT_OF_STOCK',
                shipping: product.fulfillment || 'Standard shipping',
                url: product.productUrl || product.canonicalUrl || `https://www.walmart.com`
            }]
        }));
    } catch (error) {
        console.error('❌ Walmart API Error:', error);
        return [];
    }
};

/**
 * Fetch products from AliExpress via RapidAPI
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of products from AliExpress
 */
const fetchFromAliExpress = async (query) => {
    try {
        // Using "AliExpress DataHub" API from RapidAPI
        const url = `https://${API_KEYS.aliexpress.host}/item_search?q=${encodeURIComponent(query)}&page=1&sort=default`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEYS.rapidapi,
                'x-rapidapi-host': API_KEYS.aliexpress.host
            }
        });
        
        const data = await response.json();
        
        // Handle different response structures
        const items = data.result?.resultList || data.items || [];
        
        return items.slice(0, 10).map((item, index) => ({
            id: `aliexpress_${item.itemId || item.productId || index}`,
            name: item.title || item.productTitle || 'Unknown Product',
            description: item.title || item.productTitle || '',
            category: item.categoryName || 'general',
            image: item.imageUrl || item.productImage || item.image_url || '',
            thumbnail: item.imageUrl || item.productImage || '',
            rating: parseFloat(item.averageStarRate || item.rating || 4.0),
            popularity: parseInt(item.tradeCount || item.orders || 50),
            prices: [{
                retailer: 'AliExpress',
                price: parseFloat(item.minPrice || item.price || 0),
                inStock: true,
                url: item.productUrl || item.itemUrl || `https://www.aliexpress.com/item/${item.itemId}.html`
            }]
        }));
    } catch (error) {
        console.error('AliExpress API Error:', error);
        return [];
    }
};

/**
 * Merge products from multiple sources by matching similar names
 * @param {Array} amazonProducts - Products from Amazon
 * @param {Array} walmartProducts - Products from Walmart
 * @param {Array} aliexpressProducts - Products from AliExpress
 * @returns {Array} Merged products with prices from all sources
 */
const mergeProducts = (amazonProducts, walmartProducts, aliexpressProducts) => {
    const allProducts = [];
    const productMap = new Map();
    
    // Helper function to normalize product names for matching
    const normalizeName = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .split(/\s+/)
            .slice(0, 4) // Use first 4 words for matching
            .join(' ');
    };
    
    // Process all products from all sources
    [...amazonProducts, ...walmartProducts, ...aliexpressProducts].forEach(product => {
        const normalizedName = normalizeName(product.name);
        
        if (productMap.has(normalizedName)) {
            // Product exists, add price from this retailer
            const existing = productMap.get(normalizedName);
            existing.prices.push(...product.prices);
            // Update rating and reviews if better
            if (product.rating > existing.rating) {
                existing.rating = product.rating;
            }
            existing.reviews = (existing.reviews || 0) + (product.reviews || 0);
        } else {
            // New product
            productMap.set(normalizedName, {
                ...product,
                prices: [...product.prices]
            });
        }
    });
    
    return Array.from(productMap.values());
};

/* ===================================
   FALLBACK: MOCK DATA FOR TESTING
   =================================== */

/**
 * Mock product data for testing (when APIs not configured)
 */
const mockProducts = [
    {
        id: 1,
        name: 'Wireless Headphones Pro',
        description: 'Premium noise-cancelling wireless headphones',
        category: 'electronics',
        rating: 4.5,
        popularity: 95,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 299.99, inStock: true },
            { retailer: 'Best Buy', price: 279.99, inStock: true },
            { retailer: 'Walmart', price: 289.99, inStock: false }
        ]
    },
    {
        id: 2,
        name: 'Smart Watch Ultra',
        description: 'Advanced fitness tracking smartwatch',
        category: 'electronics',
        rating: 4.8,
        popularity: 92,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 399.99, inStock: true },
            { retailer: 'Best Buy', price: 399.99, inStock: true },
            { retailer: 'Target', price: 389.99, inStock: true }
        ]
    },
    {
        id: 3,
        name: 'Laptop Pro 15"',
        description: 'High-performance laptop for professionals',
        category: 'electronics',
        rating: 4.6,
        popularity: 88,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 1299.99, inStock: true },
            { retailer: 'Best Buy', price: 1249.99, inStock: true },
            { retailer: 'Newegg', price: 1279.99, inStock: true }
        ]
    },
    {
        id: 4,
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        category: 'electronics',
        rating: 4.3,
        popularity: 78,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 49.99, inStock: true },
            { retailer: 'Best Buy', price: 54.99, inStock: true },
            { retailer: 'Walmart', price: 44.99, inStock: true }
        ]
    },
    {
        id: 5,
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes for maximum performance',
        category: 'sports',
        rating: 4.7,
        popularity: 85,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 129.99, inStock: true },
            { retailer: 'Nike Store', price: 139.99, inStock: true },
            { retailer: 'Footlocker', price: 134.99, inStock: true }
        ]
    },
    {
        id: 6,
        name: 'Designer Sunglasses',
        description: 'Stylish UV protection sunglasses',
        category: 'fashion',
        rating: 4.4,
        popularity: 72,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 89.99, inStock: true },
            { retailer: 'Sunglass Hut', price: 99.99, inStock: true },
            { retailer: 'Target', price: 84.99, inStock: true }
        ]
    },
    {
        id: 7,
        name: 'Coffee Maker Deluxe',
        description: 'Programmable coffee maker with thermal carafe',
        category: 'home',
        rating: 4.2,
        popularity: 68,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 79.99, inStock: true },
            { retailer: 'Best Buy', price: 84.99, inStock: true },
            { retailer: 'Walmart', price: 74.99, inStock: true }
        ]
    },
    {
        id: 8,
        name: 'Gaming Keyboard RGB',
        description: 'Mechanical gaming keyboard with RGB lighting',
        category: 'electronics',
        rating: 4.6,
        popularity: 90,
        image: '',
        prices: [
            { retailer: 'Amazon', price: 149.99, inStock: true },
            { retailer: 'Best Buy', price: 159.99, inStock: true },
            { retailer: 'Newegg', price: 144.99, inStock: true }
        ]
    }
];

/**
 * Simulate API delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Self-contained fallback image (no local assets needed)
window.__IMG_PLACEHOLDER__ = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
        <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#f5f2ed"/>
            <stop offset="1" stop-color="#ebe6df"/>
        </linearGradient>
    </defs>
    <rect width="800" height="600" rx="32" fill="url(#bg)"/>
    <rect x="160" y="160" width="480" height="280" rx="24" fill="#ffffff" stroke="#e8e3dd" stroke-width="6"/>
    <rect x="210" y="205" width="380" height="170" rx="16" fill="#faf8f5" stroke="#e8e3dd" stroke-width="4"/>
    <rect x="260" y="390" width="280" height="18" rx="9" fill="#d4cdc4"/>
    <circle cx="400" cy="290" r="34" fill="#8b7355" opacity="0.25"/>
    <path d="M365 300l18 18 52-56" fill="none" stroke="#8b7355" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    <text x="400" y="485" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="26" fill="#6b6460">No image available</text>
</svg>
`)}`;

const normalizeQuery = (value) => {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Fetch products from all 3 e-commerce APIs
 * @param {string} searchQuery - Search query string
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Promise resolving to array of products
 */
const fetchProducts = async (searchQuery = '', filters = {}) => {
    let results = [];
    
    // Check if APIs are configured
    if (!areAPIsConfigured()) {
        console.warn('⚠️ API keys not configured. Using mock data for demonstration.');
        console.log('📝 To use real APIs, update API_KEYS in app.js with your actual keys.');
        
        // Use mock data as fallback
        await delay(300);
        results = [...mockProducts];
        
        // Filter mock data by search query (punctuation-tolerant)
        if (searchQuery) {
            const query = normalizeQuery(searchQuery);
            results = results.filter(product => {
                const name = normalizeQuery(product.name);
                const description = normalizeQuery(product.description);
                const category = normalizeQuery(product.category);
                return name.includes(query) || description.includes(query) || category.includes(query);
            });
        }
    } else {
        // Fetch from all 3 real APIs in parallel
        console.log('🔍 Searching across Amazon, Walmart, and AliExpress...');
        
        try {
            const [amazonProducts, walmartProducts, aliexpressProducts] = await Promise.all([
                fetchFromAmazon(searchQuery || 'laptop'),
                fetchFromWalmart(searchQuery || 'laptop'),
                fetchFromAliExpress(searchQuery || 'laptop')
            ]);
            
            console.log(`✅ Amazon: ${amazonProducts.length} products`);
            console.log(`✅ Walmart: ${walmartProducts.length} products`);
            console.log(`✅ AliExpress: ${aliexpressProducts.length} products`);
            
            // Combine all products (don't merge - show each separately with its own image)
            results = [...amazonProducts, ...walmartProducts, ...aliexpressProducts];
            
            console.log(`📊 Total products from all platforms: ${results.length}`);

            // Fallback to demo data if APIs return nothing (403 = no subscription)
            if (results.length === 0) {
                console.warn('⚠️ APIs returned 0 results (likely need subscription). Showing demo data.');
                console.log('📝 To use real APIs:');
                console.log('   1. Go to https://rapidapi.com/');
                console.log('   2. Subscribe to: Amazon Real-Time Data, Walmart Data, AliExpress DataHub');
                console.log('   3. Your key is already in the code - just activate subscriptions!');
                showNotification('Demo mode: API subscriptions needed for real data. Check console for details.', 'info');
                
                // Show demo products matching the search
                await delay(300);
                results = [...mockProducts];
                const query = normalizeQuery(searchQuery);
                if (query) {
                    results = results.filter(product => {
                        const name = normalizeQuery(product.name);
                        const description = normalizeQuery(product.description);
                        const category = normalizeQuery(product.category);
                        return name.includes(query) || description.includes(query) || category.includes(query);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error fetching from APIs:', error);
            console.log('💡 Tip: 403 errors mean you need to subscribe to the APIs on RapidAPI.com');
            showNotification('Demo mode: Using sample data. Subscribe to APIs on RapidAPI for real results.', 'warning');
            
            // Show demo data on error
            await delay(300);
            results = [...mockProducts];
            const query = normalizeQuery(searchQuery);
            if (query) {
                results = results.filter(product => {
                    const name = normalizeQuery(product.name);
                    const description = normalizeQuery(product.description);
                    const category = normalizeQuery(product.category);
                    return name.includes(query) || description.includes(query) || category.includes(query);
                });
            }
        }
    }

    // Apply filters
    if (filters.category) {
        results = results.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        results = results.filter(product => {
            const bestPrice = getBestPrice(product.prices);
            if (!bestPrice) return false;
            
            const min = filters.minPrice ?? 0;
            const max = filters.maxPrice ?? Infinity;
            return bestPrice.price >= min && bestPrice.price <= max;
        });
    }

    if (filters.rating) {
        results = results.filter(p => p.rating >= filters.rating);
    }

    // Sort results
    if (filters.sort) {
        results = sortProducts(results, filters.sort);
    }

    return results;
};

/**
 * Simulated API call to fetch single product details
 * @param {number} productId - Product ID
 * @returns {Promise<Object|null>} Promise resolving to product object or null
 */
const fetchProductById = async (productId) => {
     await delay(300);
     return mockProducts.find(p => p.id === productId) || null;
};

/* ===================================
    SEARCH SYSTEM FUNCTIONS
    =================================== */

/**
 * Voice recognition instance
 */
let recognition = null;
let isListening = false;

/**
 * Initialize Web Speech API
 */
const initVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = transcript;
                handleSearch();
            }
        };

        recognition.onend = () => {
            isListening = false;
            const voiceBtn = document.getElementById('voiceSearchBtn');
            voiceBtn?.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            showNotification('Voice search error. Please try again.', 'error');
            isListening = false;
            const voiceBtn = document.getElementById('voiceSearchBtn');
            voiceBtn?.classList.remove('listening');
        };
    }
};

/**
 * Toggle voice search
 */
const toggleVoiceSearch = () => {
    if (!recognition) {
        showNotification('Voice search not supported in this browser', 'warning');
        return;
    }

    const voiceBtn = document.getElementById('voiceSearchBtn');

    if (isListening) {
        recognition.stop();
        isListening = false;
        voiceBtn?.classList.remove('listening');
    } else {
        recognition.start();
        isListening = true;
        voiceBtn?.classList.add('listening');
        showNotification('Listening... Speak now', 'info');
    }
};

/**
 * Update search history in localStorage
 * @param {string} query - Search query to add to history
 */
const updateSearchHistory = (query) => {
    if (!query || query.trim().length < 2) return;

    const history = storage.get('searchHistory', []);
    
    // Remove duplicate if exists
    const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    // Add to beginning of array
    filtered.unshift(query);
    
    // Keep only last 10 searches
    const limited = filtered.slice(0, 10);
    
    storage.set('searchHistory', limited);
    renderRecentSearches();
};

/**
 * Get search suggestions based on input
 * @param {string} query - Search query
 * @returns {Array} Array of suggestion objects
 */
const getSearchSuggestions = (query) => {
    if (!query || query.length < 2) return [];

    const suggestions = [];
    const queryLower = query.toLowerCase();

    // Search in product names and categories
    mockProducts.forEach(product => {
        if (product.name.toLowerCase().includes(queryLower)) {
            suggestions.push({
                text: product.name,
                category: product.category,
                type: 'product'
            });
        }
    });

    // Add category suggestions
    const categories = ['electronics', 'fashion', 'home', 'sports', 'beauty', 'toys'];
    categories.forEach(cat => {
        if (cat.includes(queryLower)) {
            suggestions.push({
                text: cat.charAt(0).toUpperCase() + cat.slice(1),
                category: 'Category',
                type: 'category'
            });
        }
    });

    // Remove duplicates and limit to 6
    const unique = suggestions.filter((item, index, self) =>
        index === self.findIndex(t => t.text === item.text)
    );

    return unique.slice(0, 6);
};

const escapeHtml = (value) => {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};

/**
 * Display search suggestions
 * @param {Array} suggestions - Array of suggestion objects
 */
const displaySearchSuggestions = (suggestions) => {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    const suggestionsList = document.getElementById('suggestionsList');
    const loadingEl = suggestionsContainer?.querySelector('.suggestions-loading');

    if (!suggestionsContainer || !suggestionsList) return;

    // Hide loading
    loadingEl?.classList.remove('active');

    if (suggestions.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }

    suggestionsList.innerHTML = suggestions.map((suggestion) => {
        const icon = suggestion.type === 'category' ? 'th-large' : (suggestion.type === 'brand' ? 'tag' : 'search');
        const text = escapeHtml(suggestion.text);
        const category = escapeHtml(suggestion.category);
        return `
            <div class="suggestion-item" data-suggestion="${text}">
                <i class="fas fa-${icon}"></i>
                <span class="suggestion-text">${text}</span>
                <span class="suggestion-category">${category}</span>
            </div>
        `;
    }).join('');

    suggestionsContainer.classList.add('active');

    // Add click handlers
    suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            const suggestionText = item.dataset.suggestion;
            if (searchInput) {
                searchInput.value = suggestionText;
                handleSearch();
            }
        });
    });
};

/**
 * Show search suggestions with loading state
 * @param {string} query - Search query
 */
const showSearchSuggestions = async (query) => {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    const loadingEl = suggestionsContainer?.querySelector('.suggestions-loading');

    if (!query || query.length < 2) {
        suggestionsContainer?.classList.remove('active');
        return;
    }

    // Show loading
    suggestionsContainer?.classList.add('active');
    loadingEl?.classList.add('active');

    // Simulate network delay
    await delay(150);

    const suggestions = getSearchSuggestions(query);
    displaySearchSuggestions(suggestions);
};

/**
 * Render recent searches
 */
const renderRecentSearches = () => {
    const recentList = document.getElementById('recentList');
    const history = storage.get('searchHistory', []);

    if (!recentList) return;

    if (!Array.isArray(history) || history.length === 0) {
        recentList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted);">No recent searches</div>';
        return;
    }

    recentList.innerHTML = history.map((query) => {
        const encoded = encodeURIComponent(query);
        const safeText = escapeHtml(query);
        return `
            <div class="recent-item" data-query="${encoded}">
                <div class="recent-item-text">
                    <i class="fas fa-history"></i>
                    <span>${safeText}</span>
                </div>
                <button class="remove-recent-btn" type="button" aria-label="Remove from recent searches" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    recentList.querySelectorAll('.recent-item').forEach((item) => {
        const encoded = item.getAttribute('data-query') || '';
        const query = decodeURIComponent(encoded);

        item.addEventListener('click', (e) => {
            const clickedRemove = e.target instanceof Element ? e.target.closest('.remove-recent-btn') : null;
            if (clickedRemove) return;

            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = query;
            document.getElementById('recentSearches')?.classList.remove('active');
            handleSearch();
        });

        const removeBtn = item.querySelector('.remove-recent-btn');
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = storage.get('searchHistory', []);
            storage.set('searchHistory', current.filter((q) => q !== query));
            renderRecentSearches();
        });
    });
};

/**
 * Clear search history
 */
const clearSearchHistory = () => {
    storage.set('searchHistory', []);
    renderRecentSearches();
    document.getElementById('recentSearches')?.classList.remove('active');
    showNotification('Search history cleared', 'success');
};

/**
 * Get current filter values
 * @returns {Object} Current filter values
 */
const getCurrentFilters = () => {
    return {
        category: document.getElementById('categoryFilter')?.value || '',
        minPrice: parseFloat(document.getElementById('minPrice')?.value) || 0,
        maxPrice: parseFloat(document.getElementById('maxPrice')?.value) || 5000,
        rating: parseFloat(document.getElementById('ratingFilter')?.value) || 0,
        sort: document.getElementById('sortFilter')?.value || 'relevance'
    };
};

/**
 * Apply filters and update products
 */
const applyFilters = async () => {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput?.value.trim() || '';
    const filters = getCurrentFilters();

    await searchProducts(query, filters);
};

/**
 * Sort products based on criteria
 * @param {Array} products - Array of products
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted products
 */
const sortProducts = (products, sortBy) => {
    const sorted = [...products];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => {
                const priceA = getBestPrice(a.prices)?.price ?? Infinity;
                const priceB = getBestPrice(b.prices)?.price ?? Infinity;
                return priceA - priceB;
            });
        case 'price-desc':
            return sorted.sort((a, b) => {
                const priceA = getBestPrice(a.prices)?.price ?? 0;
                const priceB = getBestPrice(b.prices)?.price ?? 0;
                return priceB - priceA;
            });
        case 'rating':
            return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'popularity':
            return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        default:
            return sorted;
    }
};

/**
 * Show loading overlay
 */
const showLoading = () => {
    document.getElementById('loadingOverlay')?.classList.add('active');
};

/**
 * Hide loading overlay
 */
const hideLoading = () => {
    document.getElementById('loadingOverlay')?.classList.remove('active');
};

/**
 * Update results info
 * @param {number} count - Number of results
 * @param {string} query - Search query
 */
const updateResultsInfo = (count, query = '') => {
    const resultsInfo = document.getElementById('resultsInfo');
    const resultsCount = resultsInfo?.querySelector('.results-count');
    
    if (resultsCount) {
        if (query) {
            resultsCount.textContent = `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
        } else if (count === 0) {
            resultsCount.textContent = 'Ready to search.';
        } else {
            resultsCount.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
        }
    }
};

/**
 * Update active search indicator
 * @param {string} query - Search query
 */
const updateActiveSearch = (query) => {
    const activeSearch = document.getElementById('activeSearch');
    const searchTerm = activeSearch?.querySelector('.search-term');
    
    if (query && query.trim()) {
        activeSearch?.classList.add('visible');
        if (searchTerm) {
            searchTerm.textContent = `Search: "${query}"`;
        }
    } else {
        activeSearch?.classList.remove('visible');
    }
};

/**
 * Main search function
 * @param {string} query - Search query
 * @param {Object} filters - Filter options
 */
const searchProducts = async (query = '', filters = null) => {
    if (!query || !query.trim()) {
        renderProducts([]);
        updateResultsInfo(0, '');
        updateActiveSearch('');
        document.getElementById('searchSuggestions')?.classList.remove('active');
        document.getElementById('recentSearches')?.classList.remove('active');
        return [];
    }

    const currentFilters = filters || getCurrentFilters();
    
    // Show loading state
    showLoading();
    
    try {
        // Fetch products with filters
        const products = await fetchProducts(query, currentFilters);
        
        // Render products
        renderProducts(products);
        
        // Update UI
        updateResultsInfo(products.length, query);
        updateActiveSearch(query);
        
        // Hide suggestions and recent searches
        document.getElementById('searchSuggestions')?.classList.remove('active');
        document.getElementById('recentSearches')?.classList.remove('active');
        
        // Update search history if there's a query
        if (query && query.trim()) {
            updateSearchHistory(query);
        }
        
        showNotification(`Found ${products.length} product${products.length !== 1 ? 's' : ''}`, 'success');
        return products;
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.', 'error');
        return [];
    } finally {
        hideLoading();
    }
};


/**
 * Simulated API call to fetch price history
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} Promise resolving to price history array
 */
const fetchPriceHistory = async (productId) => {
    await delay(400);
    
    // Generate mock price history data
    const dates = [];
    const prices = [];
    const basePrice = mockProducts.find(p => p.id === productId)?.prices[0]?.price || 100;
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Generate random price variation
        const variation = (Math.random() - 0.5) * 50;
        prices.push(Math.max(basePrice + variation, basePrice * 0.8));
    }
    
    return { dates, prices };
};

/* ===================================
   UTILITY FUNCTIONS
   =================================== */

/**
 * Get the best price from an array of prices
 * @param {Array} prices - Array of price objects
 * @returns {Object|null} Price object with lowest price
 */
const getBestPrice = (prices) => {
    if (!prices || prices.length === 0) return null;
    return prices.reduce((best, current) => 
        current.price < best.price ? current : best
    );
};

/**
 * Format price to currency string
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(price);
};

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
const showNotification = (message, type = 'info') => {
    // Simple console notification (can be enhanced with UI toast)
    const emoji = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    }[type] || 'ℹ';
    
    console.log(`${emoji} ${type.toUpperCase()}: ${message}`);
    
    // TODO: Implement visual toast notification UI
};

/**
 * Debounce function to limit function execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/* ===================================
   DOM MANIPULATION FUNCTIONS
   =================================== */

/**
 * Create product card HTML element with BEST PRICE highlighting
 * @param {Object} product - Product object
 * @returns {string} HTML string for product card
 */
const createProductCard = (product) => {
    const bestPrice = getBestPrice(product.prices);
    
    // Calculate savings
    const prices = product.prices.map(p => p.price).filter(p => p > 0);
    const maxPrice = Math.max(...prices);
    const savings = maxPrice - bestPrice.price;
    const savingsPercent = ((savings / maxPrice) * 100).toFixed(0);
    
    // Generate rating stars
    const rating = product.rating || 4.0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const starsHtml = `
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
    
    const priceItems = product.prices
        .sort((a, b) => a.price - b.price)
        .map(priceObj => {
            const isBest = priceObj.retailer === bestPrice.retailer;
            return `
                <div class="price-item ${isBest ? 'best-price' : ''}">
                    <span class="retailer-name">
                        <i class="fas fa-store"></i> ${priceObj.retailer}
                        ${isBest ? '<span class="best-badge"><i class="fas fa-crown"></i> BEST PRICE</span>' : ''}
                    </span>
                    <span class="price">${formatPrice(priceObj.price)}</span>
                </div>
            `;
        })
        .join('');
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${product.image || window.__IMG_PLACEHOLDER__}" alt="${product.name}" class="product-image" 
                     onerror="this.onerror=null; this.src=window.__IMG_PLACEHOLDER__;">
                ${savings > 0 ? `<div class="savings-badge">Save ${savingsPercent}%</div>` : ''}
                <button class="wishlist-btn" onclick="addToWishlist(${product.id})" title="Add to wishlist">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-content">
                <h3 class="product-title" title="${product.name}">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${starsHtml}</div>
                    <span class="rating-text">${rating.toFixed(1)} ${product.reviews ? `(${product.reviews})` : ''}</span>
                </div>
                <p class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                
                <div class="price-comparison-header">
                    <i class="fas fa-chart-line"></i> Price Comparison
                </div>
                <div class="product-prices">
                    ${priceItems}
                </div>
                
                ${savings > 0 ? `
                    <div class="savings-info">
                        <i class="fas fa-piggy-bank"></i>
                        Save <strong>${formatPrice(savings)}</strong> with best price!
                    </div>
                ` : ''}
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="viewProduct('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Compare & Buy
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Render products to the DOM
 * @param {Array} products - Array of product objects
 */
const renderProducts = (products) => {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.warn('Products grid element not found');
        return;
    }
    
    if (!Array.isArray(products) || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔎</div>
                <h3>No products to show</h3>
                <p>Search for a product to compare prices.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(createProductCard).join('');
};

/* ===================================
   EVENT HANDLERS
   =================================== */

/**
 * Handle search functionality
 */
const handleSearch = withErrorHandling(async () => {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput?.value.trim() || '';
    
    if (!searchQuery) {
        console.log('Empty search query');
        return;
    }
    
    console.log('🔍 Searching for:', searchQuery);
    await searchProducts(searchQuery);
    document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' });
}, 'Search');

/**
 * Handle mobile navigation toggle
 */
const handleNavToggle = () => {
    const navMenu = document.querySelector('.nav-menu');
    navMenu?.classList.toggle('active');
};

/**
 * View product details
 * @param {number} productId - Product ID
 */
window.viewProduct = withErrorHandling(async (productId) => {
    const product = await fetchProductById(productId);
    
    if (product) {
        showNotification(`Viewing details for: ${product.name}`, 'info');
        console.log('Product Details:', product);
        // TODO: Implement modal or navigate to product detail page
    }
}, 'View Product');

/**
 * Add product to wishlist
 * @param {number} productId - Product ID
 */
window.addToWishlist = withErrorHandling((productId) => {
    const wishlist = storage.get('wishlist', []);
    
    if (wishlist.includes(productId)) {
        showNotification('Product already in wishlist', 'warning');
        return;
    }
    
    wishlist.push(productId);
    storage.set('wishlist', wishlist);
    showNotification('Product added to wishlist!', 'success');
}, 'Add to Wishlist');

/* ===================================
   INITIALIZATION
   =================================== */

/**
 * Initialize the application
 */
const initApp = withErrorHandling(async () => {
    console.log('🚀 Price Comparison App Initializing...');
    
    // Elements
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const navToggle = document.getElementById('navToggle');

    // Search button click
    searchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        handleSearch();
    });

    // Search on Enter key
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });

    // Debounced suggestions + clear button
    searchInput?.addEventListener('input', debounce((e) => {
        const query = (e.target?.value || '').trim();

        if (query) {
            clearSearchBtn?.classList.add('visible');
            showSearchSuggestions(query);
        } else {
            clearSearchBtn?.classList.remove('visible');
            document.getElementById('searchSuggestions')?.classList.remove('active');
        }
    }, 300));

    // Show recent searches on focus when input is empty
    searchInput?.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (!query) {
            renderRecentSearches();
            document.getElementById('recentSearches')?.classList.add('active');
            document.getElementById('searchSuggestions')?.classList.remove('active');
        }
    });

    // Hide dropdowns on blur (delay allows clicking)
    searchInput?.addEventListener('blur', () => {
        setTimeout(() => {
            document.getElementById('searchSuggestions')?.classList.remove('active');
            document.getElementById('recentSearches')?.classList.remove('active');
        }, 200);
    });

    // Clear search
    clearSearchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        clearSearchBtn.classList.remove('visible');
        document.getElementById('searchSuggestions')?.classList.remove('active');
        document.getElementById('recentSearches')?.classList.remove('active');
        renderProducts([]);
        updateResultsInfo(0, '');
        updateActiveSearch('');
    });

    // Voice search
    voiceSearchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleVoiceSearch();
    });

    // Clear history
    clearHistoryBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        clearSearchHistory();
    });

    // Clear all (search + filters)
    clearAllBtn?.addEventListener('click', (e) => {
        e.preventDefault();

        if (searchInput) searchInput.value = '';
        clearSearchBtn?.classList.remove('visible');

        const categoryFilter = document.getElementById('categoryFilter');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const ratingFilter = document.getElementById('ratingFilter');
        const sortFilter = document.getElementById('sortFilter');
        const priceRangeMin = document.getElementById('priceRangeMin');
        const priceRangeMax = document.getElementById('priceRangeMax');

        if (categoryFilter) categoryFilter.value = '';
        if (minPrice) minPrice.value = '0';
        if (maxPrice) maxPrice.value = '5000';
        if (priceRangeMin) priceRangeMin.value = '0';
        if (priceRangeMax) priceRangeMax.value = '5000';
        if (ratingFilter) ratingFilter.value = '';
        if (sortFilter) sortFilter.value = 'relevance';

        document.getElementById('searchSuggestions')?.classList.remove('active');
        document.getElementById('recentSearches')?.classList.remove('active');
        renderProducts([]);
        updateResultsInfo(0, '');
        updateActiveSearch('');
    });

    // Filters
    document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
    document.getElementById('ratingFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sortFilter')?.addEventListener('change', applyFilters);

    // Price range inputs
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const priceRangeMin = document.getElementById('priceRangeMin');
    const priceRangeMax = document.getElementById('priceRangeMax');

    minPriceInput?.addEventListener('change', () => {
        if (priceRangeMin) priceRangeMin.value = minPriceInput.value;
        applyFilters();
    });

    maxPriceInput?.addEventListener('change', () => {
        if (priceRangeMax) priceRangeMax.value = maxPriceInput.value;
        applyFilters();
    });

    priceRangeMin?.addEventListener('input', () => {
        if (minPriceInput) minPriceInput.value = priceRangeMin.value;
    });
    priceRangeMin?.addEventListener('change', applyFilters);

    priceRangeMax?.addEventListener('input', () => {
        if (maxPriceInput) maxPriceInput.value = priceRangeMax.value;
    });
    priceRangeMax?.addEventListener('change', applyFilters);

    // Mobile navigation toggle
    navToggle?.addEventListener('click', handleNavToggle);
    
    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-menu')?.classList.remove('active');
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });

            // Update active nav link state
            if (this.classList.contains('nav-link')) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Initialize voice search (if supported)
    initVoiceSearch();

    // Start empty
    renderProducts([]);
    updateResultsInfo(0, '');
    
    console.log('✅ Price Comparison App Initialized Successfully!');
    console.log('💡 Enter a search term and click Search to find products');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 API STATUS:');
    if (areAPIsConfigured()) {
        console.log('✅ API KEY DETECTED - Ready to fetch real data!');
        console.log('   • Amazon Real-Time Data API');
        console.log('   • Walmart Data API');
        console.log('   • AliExpress DataHub API');
        console.log('');
        console.log('💡 NOTE: If you see 403 errors, you need to subscribe to these APIs at:');
        console.log('   https://rapidapi.com/hub');
        console.log('');
        console.log('💰 PRICE COMPARISON READY!');
    } else {
        console.log('⚠️  APIs Not Configured - Using mock data');
        console.log('');
        console.log('📝 TO USE REAL APIs:');
        console.log('1. Get RapidAPI key: https://rapidapi.com/');
        console.log('2. Subscribe to: Amazon, Walmart, AliExpress APIs');
        console.log('3. Update API_KEYS.rapidapi in app.js');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}, 'App Initialization');

/* ===================================
   APP ENTRY POINT
   =================================== */

// Initialize app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/* ===================================
   EXPORT FOR MODULE USAGE (Optional)
   =================================== */

// Uncomment if using ES6 modules
// export { storage, fetchProducts, formatPrice, getBestPrice };
