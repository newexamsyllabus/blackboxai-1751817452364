// GirOrganic Shopify Theme JavaScript
// Based on the original GirOrganic website functionality

class GirOrganicTheme {
    constructor() {
        this.init();
    }

    init() {
        this.initializeCarousel();
        this.initializeTabs();
        this.initializeSearch();
        this.initializeProductInteractions();
        this.initializeTestimonials();
        this.initializeMobileMenu();
        this.initializeCart();
        this.initializeProductForm();
        this.initializeQuickView();
    }

    // Hero Carousel Functionality
    initializeCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        
        if (slides.length === 0) return;
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        };
        
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        
        // Auto-advance carousel every 5 seconds
        setInterval(nextSlide, 5000);
        
        // Initialize first slide
        showSlide(0);
    }

    // Tab Functionality for Discover Section
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const productGrids = document.querySelectorAll('.products-grid');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Filter products based on tab
                this.filterProductsByTab(targetTab);
            });
        });
    }

    filterProductsByTab(tab) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productTags = product.dataset.tags ? product.dataset.tags.split(',') : [];
            
            switch(tab) {
                case 'best-seller':
                    product.style.display = productTags.includes('best-seller') ? 'block' : 'none';
                    break;
                case 'value-saver':
                    product.style.display = productTags.includes('sale') ? 'block' : 'none';
                    break;
                case 'recently-released':
                    product.style.display = productTags.includes('new') ? 'block' : 'none';
                    break;
                default:
                    product.style.display = 'block';
            }
        });
    }

    // Search Functionality
    initializeSearch() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchTerm = searchInput.value.trim();
                
                if (searchTerm) {
                    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
                }
            });
        }
        
        // Search suggestions
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                const value = this.value.trim();
                
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (value.length > 2) {
                        this.fetchSearchSuggestions(value);
                    }
                }, 300);
            });
        }
    }

    fetchSearchSuggestions(query) {
        fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
            .then(response => response.json())
            .then(data => {
                this.displaySearchSuggestions(data.resources.results.products);
            })
            .catch(error => console.error('Search suggestions error:', error));
    }

    displaySearchSuggestions(products) {
        // Implementation for search suggestions dropdown
        console.log('Search suggestions:', products);
    }

    // Product Interactions
    initializeProductInteractions() {
        // Add to Cart functionality
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (button.disabled) return;
                
                const productCard = button.closest('.product-card');
                const variantId = button.dataset.variantId;
                const quantity = 1;
                
                if (variantId) {
                    this.addToCart(variantId, quantity, button);
                }
            });
        });
        
        // Variant Selection
        const variantSelects = document.querySelectorAll('.variant-select');
        
        variantSelects.forEach(select => {
            select.addEventListener('change', function() {
                const productCard = this.closest('.product-card');
                const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                
                // Update add to cart button with new variant ID
                addToCartBtn.dataset.variantId = this.value;
                
                // Update price if needed
                this.updateProductPrice(productCard, this.value);
            });
        });
    }

    // Add to Cart Function
    addToCart(variantId, quantity, button) {
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        button.disabled = true;
        
        const formData = {
            'items': [{
                'id': variantId,
                'quantity': quantity
            }]
        };
        
        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            button.textContent = 'Added!';
            button.style.background = '#28a745';
            
            // Update cart count
            this.updateCartCount();
            
            // Show success notification
            this.showNotification('Product added to cart successfully!', 'success');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            button.textContent = originalText;
            button.disabled = false;
            this.showNotification('Error adding product to cart', 'error');
        });
    }

    // Update Cart Count
    updateCartCount() {
        fetch('/cart.js')
            .then(response => response.json())
            .then(cart => {
                const cartLinks = document.querySelectorAll('.cart-link');
                cartLinks.forEach(link => {
                    const countElement = link.querySelector('.cart-count');
                    if (countElement) {
                        countElement.textContent = cart.item_count;
                    } else {
                        link.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart (${cart.item_count})`;
                    }
                });
            })
            .catch(error => console.error('Error updating cart count:', error));
    }

    // Update Product Price
    updateProductPrice(productCard, variantId) {
        // This would typically fetch variant data and update pricing
        console.log(`Updating price for variant: ${variantId}`);
    }

    // Notification System
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '5px',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Testimonials Carousel
    initializeTestimonials() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        if (testimonialCards.length > 0) {
            testimonialCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }
    }

    // Mobile Menu Functionality
    initializeMobileMenu() {
        const header = document.querySelector('.header-main .container');
        const navigation = document.querySelector('.navigation');
        
        if (window.innerWidth <= 768 && navigation) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.style.cssText = `
                display: block;
                background: none;
                border: none;
                font-size: 20px;
                color: #333;
                cursor: pointer;
                padding: 10px;
            `;
            
            const headerContent = document.querySelector('.header-content');
            headerContent.insertBefore(mobileMenuBtn, navigation);
            
            mobileMenuBtn.addEventListener('click', function() {
                navigation.classList.toggle('mobile-menu-open');
                
                if (navigation.classList.contains('mobile-menu-open')) {
                    navigation.style.cssText = `
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 1000;
                        padding: 20px;
                    `;
                    
                    const navMenu = navigation.querySelector('.nav-menu');
                    navMenu.style.cssText = `
                        flex-direction: column;
                        gap: 15px;
                    `;
                } else {
                    navigation.style.cssText = '';
                    navigation.querySelector('.nav-menu').style.cssText = '';
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!navigation.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    navigation.classList.remove('mobile-menu-open');
                    navigation.style.cssText = '';
                    navigation.querySelector('.nav-menu').style.cssText = '';
                }
            });
        }
    }

    // Cart Drawer Functionality
    initializeCart() {
        const cartLinks = document.querySelectorAll('.cart-link');
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartOverlay = document.querySelector('.cart-overlay');
        const cartClose = document.querySelector('.cart-close');
        
        if (cartDrawer) {
            cartLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openCartDrawer();
                });
            });
            
            if (cartClose) {
                cartClose.addEventListener('click', () => {
                    this.closeCartDrawer();
                });
            }
            
            if (cartOverlay) {
                cartOverlay.addEventListener('click', () => {
                    this.closeCartDrawer();
                });
            }
        }
    }

    openCartDrawer() {
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartDrawer) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Fetch and update cart contents
            this.updateCartDrawer();
        }
    }

    closeCartDrawer() {
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartDrawer) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    updateCartDrawer() {
        fetch('/cart.js')
            .then(response => response.json())
            .then(cart => {
                // Update cart drawer content
                console.log('Cart data:', cart);
            })
            .catch(error => console.error('Error fetching cart:', error));
    }

    // Product Form Functionality
    initializeProductForm() {
        const productForms = document.querySelectorAll('.product-form');
        
        productForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const variantId = formData.get('id');
                const quantity = parseInt(formData.get('quantity')) || 1;
                
                const submitButton = form.querySelector('[type="submit"]');
                this.addToCart(variantId, quantity, submitButton);
            });
        });
    }

    // Quick View Functionality
    initializeQuickView() {
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');
        
        quickViewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productHandle = button.dataset.productHandle;
                this.openQuickView(productHandle);
            });
        });
    }

    openQuickView(productHandle) {
        fetch(`/products/${productHandle}.js`)
            .then(response => response.json())
            .then(product => {
                this.displayQuickView(product);
            })
            .catch(error => console.error('Error fetching product:', error));
    }

    displayQuickView(product) {
        // Implementation for quick view modal
        console.log('Quick view product:', product);
    }
}

// Shopify-specific functionality
class ShopifyIntegration {
    constructor() {
        this.initializeShopifyFeatures();
    }

    initializeShopifyFeatures() {
        this.initializeVariantSelection();
        this.initializeQuantitySelectors();
        this.initializeWishlist();
        this.initializeCompareProducts();
    }

    // Variant Selection for Product Pages
    initializeVariantSelection() {
        const variantSelectors = document.querySelectorAll('.variant-selector');
        
        variantSelectors.forEach(selector => {
            selector.addEventListener('change', () => {
                this.updateSelectedVariant();
            });
        });
    }

    updateSelectedVariant() {
        const selectors = document.querySelectorAll('.variant-selector');
        const selectedOptions = Array.from(selectors).map(selector => selector.value);
        
        // Find matching variant
        const productData = window.productData || {};
        const matchingVariant = productData.variants?.find(variant => {
            return variant.options.every((option, index) => option === selectedOptions[index]);
        });
        
        if (matchingVariant) {
            this.updateProductInfo(matchingVariant);
        }
    }

    updateProductInfo(variant) {
        // Update price
        const priceElement = document.querySelector('.product-price');
        if (priceElement && variant.price) {
            priceElement.textContent = this.formatMoney(variant.price);
        }
        
        // Update compare at price
        const compareElement = document.querySelector('.product-compare-price');
        if (compareElement && variant.compare_at_price) {
            compareElement.textContent = this.formatMoney(variant.compare_at_price);
        }
        
        // Update availability
        const availabilityElement = document.querySelector('.product-availability');
        if (availabilityElement) {
            availabilityElement.textContent = variant.available ? 'In Stock' : 'Out of Stock';
        }
        
        // Update add to cart button
        const addToCartBtn = document.querySelector('.product-form [type="submit"]');
        if (addToCartBtn) {
            addToCartBtn.disabled = !variant.available;
            addToCartBtn.textContent = variant.available ? 'Add to Cart' : 'Sold Out';
        }
    }

    formatMoney(cents) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(cents / 100);
    }

    // Quantity Selectors
    initializeQuantitySelectors() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        
        quantityInputs.forEach(input => {
            const decreaseBtn = input.parentNode.querySelector('.quantity-decrease');
            const increaseBtn = input.parentNode.querySelector('.quantity-increase');
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(input.value) || 1;
                    if (currentValue > 1) {
                        input.value = currentValue - 1;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            }
            
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(input.value) || 1;
                    input.value = currentValue + 1;
                    input.dispatchEvent(new Event('change'));
                });
            }
        });
    }

    // Wishlist Functionality
    initializeWishlist() {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.dataset.productId;
                this.toggleWishlist(productId, button);
            });
        });
    }

    toggleWishlist(productId, button) {
        const isWishlisted = button.classList.contains('wishlisted');
        
        if (isWishlisted) {
            this.removeFromWishlist(productId, button);
        } else {
            this.addToWishlist(productId, button);
        }
    }

    addToWishlist(productId, button) {
        // Implementation for adding to wishlist
        button.classList.add('wishlisted');
        this.showNotification('Added to wishlist!', 'success');
    }

    removeFromWishlist(productId, button) {
        // Implementation for removing from wishlist
        button.classList.remove('wishlisted');
        this.showNotification('Removed from wishlist!', 'info');
    }

    // Compare Products
    initializeCompareProducts() {
        const compareButtons = document.querySelectorAll('.compare-btn');
        
        compareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.dataset.productId;
                this.toggleCompare(productId, button);
            });
        });
    }

    toggleCompare(productId, button) {
        const isComparing = button.classList.contains('comparing');
        
        if (isComparing) {
            this.removeFromCompare(productId, button);
        } else {
            this.addToCompare(productId, button);
        }
    }

    addToCompare(productId, button) {
        // Implementation for adding to compare
        button.classList.add('comparing');
        this.showNotification('Added to compare!', 'success');
    }

    removeFromCompare(productId, button) {
        // Implementation for removing from compare
        button.classList.remove('comparing');
        this.showNotification('Removed from compare!', 'info');
    }

    showNotification(message, type) {
        // Use the same notification system from GirOrganicTheme
        const theme = new GirOrganicTheme();
        theme.showNotification(message, type);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new GirOrganicTheme();
    new ShopifyIntegration();
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance Monitoring
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
}

trackPerformance();

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Accessibility Improvements
function improveAccessibility() {
    const customButtons = document.querySelectorAll('.tab-btn, .add-to-cart-btn');
    
    customButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        const title = card.querySelector('.product-title')?.textContent;
        if (title) {
            card.setAttribute('aria-label', `Product: ${title}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', improveAccessibility);

// Export for use in other files
window.GirOrganicTheme = GirOrganicTheme;
window.ShopifyIntegration = ShopifyIntegration;
