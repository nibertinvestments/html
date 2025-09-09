// Indy Dining Guide - Professional Interactive JavaScript
// Handles category toggling, smooth animations, and user interactions

'use strict';

// Configuration and state management
const DiningGuide = {
    // Configuration
    config: {
        animationDuration: 400,
        scrollOffset: 100,
        debounceDelay: 300
    },
    
    // State
    state: {
        activeCategories: new Set(),
        isInitialized: false
    },
    
    // Initialize the application
    init() {
        if (this.state.isInitialized) return;
        
        this.bindEvents();
        this.setupAnimations();
        this.enhanceAccessibility();
        this.initializePreloadedCategories();
        
        this.state.isInitialized = true;
        // Application initialized successfully
    },
    
    // Bind all event listeners
    bindEvents() {
        // Category toggle functionality
        document.addEventListener('click', this.handleCategoryToggle.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        
        // Window events
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), this.config.debounceDelay));
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
        
        // Enhanced restaurant item interactions
        this.bindRestaurantInteractions();
    },
    
    // Handle category header clicks
    handleCategoryToggle(event) {
        const categoryHeader = event.target.closest('.category-header');
        if (!categoryHeader) return;
        
        if (event.preventDefault) {
            event.preventDefault();
        }
        
        const categoryCard = categoryHeader.closest('.category-card');
        const categoryContent = categoryCard.querySelector('.category-content');
        const toggleIcon = categoryHeader.querySelector('.toggle-icon');
        const categoryId = categoryCard.id;
        
        if (!categoryContent || !toggleIcon) return;
        
        // Toggle the category
        const isCurrentlyActive = this.state.activeCategories.has(categoryId);
        
        if (isCurrentlyActive) {
            this.closeCategory(categoryCard, categoryContent, categoryHeader, toggleIcon, categoryId);
        } else {
            this.openCategory(categoryCard, categoryContent, categoryHeader, toggleIcon, categoryId);
        }
        
        // Announce change to screen readers
        this.announceToggle(categoryHeader.querySelector('.category-title').textContent, !isCurrentlyActive);
    },
    
    // Open a category with smooth animation
    openCategory(categoryCard, categoryContent, categoryHeader, toggleIcon, categoryId) {
        // Add active state
        this.state.activeCategories.add(categoryId);
        categoryHeader.classList.add('active');
        categoryContent.classList.add('active');
        
        // Animate icon rotation
        toggleIcon.style.transform = 'rotate(45deg)';
        
        // Set ARIA attributes
        categoryHeader.setAttribute('aria-expanded', 'true');
        categoryContent.setAttribute('aria-hidden', 'false');
        
        // Clear any previous inline styles that might interfere
        categoryContent.style.display = '';
        categoryContent.style.opacity = '';
        categoryContent.style.transform = '';
        categoryContent.style.transition = '';
        
        // Animate restaurant items with stagger effect
        this.animateRestaurantItems(categoryContent, true);
        
        // Scroll into view if needed
        this.scrollToCategory(categoryCard);
    },
    
    // Close a category with smooth animation
    closeCategory(categoryCard, categoryContent, categoryHeader, toggleIcon, categoryId) {
        // Remove active state
        this.state.activeCategories.delete(categoryId);
        categoryHeader.classList.remove('active');
        categoryContent.classList.remove('active');
        
        // Animate icon rotation
        toggleIcon.style.transform = 'rotate(0deg)';
        
        // Set ARIA attributes
        categoryHeader.setAttribute('aria-expanded', 'false');
        categoryContent.setAttribute('aria-hidden', 'true');
        
        // Clear any inline styles to let CSS take over
        categoryContent.style.display = '';
        categoryContent.style.opacity = '';
        categoryContent.style.transform = '';
        categoryContent.style.transition = '';
    },
    
    // Animate restaurant items with stagger effect
    animateRestaurantItems(categoryContent, show = true) {
        const restaurantItems = categoryContent.querySelectorAll('.restaurant-item');
        
        restaurantItems.forEach((item, _index) => {
            const delay = _index * 100; // Stagger animation by 100ms
            
            if (show) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    },
    
    // Scroll to category if it's not fully visible
    scrollToCategory(categoryCard) {
        const rect = categoryCard.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < this.config.scrollOffset || rect.bottom > viewportHeight - this.config.scrollOffset) {
            categoryCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    },
    
    // Handle keyboard navigation
    handleKeyboardNavigation(event) {
        const categoryHeader = event.target.closest('.category-header');
        if (!categoryHeader) return;
        
        // Toggle on Enter or Space
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            categoryHeader.click();
        }
        
        // Arrow key navigation between categories
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateCategories(categoryHeader, event.key === 'ArrowDown');
        }
    },
    
    // Navigate between categories using arrow keys
    navigateCategories(currentHeader, moveDown) {
        const allHeaders = Array.from(document.querySelectorAll('.category-header'));
        const currentIndex = allHeaders.indexOf(currentHeader);
        
        let targetIndex;
        if (moveDown) {
            targetIndex = currentIndex === allHeaders.length - 1 ? 0 : currentIndex + 1;
        } else {
            targetIndex = currentIndex === 0 ? allHeaders.length - 1 : currentIndex - 1;
        }
        
        const targetHeader = allHeaders[targetIndex];
        if (targetHeader) {
            targetHeader.focus();
            targetHeader.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    },
    
    // Bind enhanced restaurant item interactions
    bindRestaurantInteractions() {
        document.addEventListener('click', (event) => {
            const websiteLink = event.target.closest('.restaurant-website');
            if (websiteLink) {
                // Add click animation
                websiteLink.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    websiteLink.style.transform = '';
                }, 150);
            }
        });
        
        // Add hover effects for restaurant items
        document.addEventListener('mouseover', (event) => {
            const restaurantItem = event.target.closest('.restaurant-item');
            if (restaurantItem) {
                this.highlightRestaurant(restaurantItem, true);
            }
        });
        
        document.addEventListener('mouseout', (event) => {
            const restaurantItem = event.target.closest('.restaurant-item');
            if (restaurantItem) {
                this.highlightRestaurant(restaurantItem, false);
            }
        });
    },
    
    // Highlight restaurant item
    highlightRestaurant(item, highlight) {
        if (highlight) {
            item.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.transform = 'translateY(-8px) scale(1.02)';
            item.style.zIndex = '10';
        } else {
            item.style.transform = '';
            item.style.zIndex = '';
        }
    },
    
    // Enhance accessibility
    enhanceAccessibility() {
        // Add ARIA attributes to category headers
        document.querySelectorAll('.category-header').forEach((header, _index) => {
            const categoryCard = header.closest('.category-card');
            const categoryContent = categoryCard.querySelector('.category-content');
            const categoryTitle = header.querySelector('.category-title');
            
            // Set up ARIA attributes
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', categoryCard.id + '-content');
            
            categoryContent.id = categoryCard.id + '-content';
            categoryContent.setAttribute('aria-hidden', 'true');
            categoryContent.setAttribute('aria-labelledby', categoryCard.id + '-title');
            
            categoryTitle.id = categoryCard.id + '-title';
            
            // Add descriptive aria-label
            const restaurantCount = categoryContent.querySelectorAll('.restaurant-item').length;
            header.setAttribute('aria-label', `${categoryTitle.textContent} section with ${restaurantCount} restaurants. Click to expand or collapse.`);
        });
        
        // Add skip link for better navigation
        this.addSkipLink();
    },
    
    // Add skip link for accessibility
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--metallic-blue);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
        }
    },
    
    // Initialize any preloaded categories (e.g., from URL hash)
    initializePreloadedCategories() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const targetCategory = document.getElementById(hash);
            if (targetCategory && targetCategory.classList.contains('category-card')) {
                const header = targetCategory.querySelector('.category-header');
                if (header) {
                    setTimeout(() => {
                        header.click();
                        targetCategory.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        }
    },
    
    // Setup initial animations
    setupAnimations() {
        // Animate category cards on load
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
        // Add scroll-triggered animations
        this.observeScrollAnimations();
    },
    
    // Observe elements for scroll-triggered animations
    observeScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            // Observe restaurant items for scroll animations
            document.querySelectorAll('.restaurant-item').forEach(item => {
                observer.observe(item);
            });
        }
    },
    
    // Handle window resize
    handleResize() {
        // Recalculate any layout-dependent features
        const activeCategories = Array.from(this.state.activeCategories);
        activeCategories.forEach(categoryId => {
            const categoryCard = document.getElementById(categoryId);
            if (categoryCard) {
                // Refresh any layout calculations if needed
                this.refreshCategoryLayout(categoryCard);
            }
        });
    },
    
    // Handle scroll events
    handleScroll() {
        // Add scroll-dependent features like header effects
        const header = document.querySelector('.main-header');
        if (header) {
            const scrolled = window.scrollY > 100;
            header.style.boxShadow = scrolled ? 'var(--shadow-heavy)' : 'var(--shadow-medium)';
        }
    },
    
    // Refresh category layout
    refreshCategoryLayout(categoryCard) {
        const categoryContent = categoryCard.querySelector('.category-content');
        if (categoryContent && categoryContent.classList.contains('active')) {
            // Force layout recalculation
            categoryContent.style.height = 'auto';
        }
    },
    
    // Announce toggle action to screen readers
    announceToggle(categoryName, isOpen) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = `${categoryName} section ${isOpen ? 'expanded' : 'collapsed'}`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    },
    
    // Utility: Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Utility: Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Global function for backward compatibility
// eslint-disable-next-line no-unused-vars
function toggleCategory(header) {
    DiningGuide.handleCategoryToggle({ target: header });
}

// Enhanced error handling
window.addEventListener('error', (event) => {
    // Log error for debugging (console allowed for error handling)
    // eslint-disable-next-line no-console
    if (console && console.error) {
        // eslint-disable-next-line no-console
        console.error('Indy Dining Guide Error:', event.error);
    }
    // Graceful degradation - ensure basic functionality still works
    if (!DiningGuide.state.isInitialized) {
        // Basic toggle fallback would go here if needed
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DiningGuide.init());
} else {
    DiningGuide.init();
}

// Export for testing or external use
/* eslint-env node */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DiningGuide;
}

// Make available globally
window.DiningGuide = DiningGuide;