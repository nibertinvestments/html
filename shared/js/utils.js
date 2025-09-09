// Shared utility functions for all projects

/**
 * DOM manipulation utilities
 */
const DOM = {
    // Select elements
    $(selector) {
        return document.querySelector(selector);
    },
    
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Create element with optional attributes and content
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },
    
    // Add event listener with optional delegation
    on(selector, event, handler, useCapture = false) {
        if (typeof selector === 'string') {
            const elements = this.$$(selector);
            elements.forEach(el => el.addEventListener(event, handler, useCapture));
        } else {
            selector.addEventListener(event, handler, useCapture);
        }
    },
    
    // Remove class from all elements, add to target
    setActiveClass(selector, activeElement, className = 'active') {
        this.$$(selector).forEach(el => el.classList.remove(className));
        if (activeElement) {
            activeElement.classList.add(className);
        }
    }
};

/**
 * HTTP utilities
 */
const HTTP = {
    async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    },
    
    async post(url, data, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
};

/**
 * Local storage utilities
 */
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
};

/**
 * Validation utilities
 */
const Validate = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    phone(phone) {
        const re = /^\+?[\d\s\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },
    
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    minLength(value, min) {
        return value && value.length >= min;
    },
    
    maxLength(value, max) {
        return value && value.length <= max;
    }
};

/**
 * Formatting utilities
 */
const Format = {
    currency(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    date(date, options = {}) {
        const defaults = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('en-US', { ...defaults, ...options })
            .format(new Date(date));
    },
    
    number(num, decimals = 0) {
        return Number(num).toFixed(decimals);
    },
    
    percentage(value, total, decimals = 1) {
        return ((value / total) * 100).toFixed(decimals) + '%';
    }
};

/**
 * Animation utilities
 */
const Animate = {
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const start = performance.now();
        
        function fade(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = 1;
            }
        }
        
        requestAnimationFrame(fade);
    },
    
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function fade(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = startOpacity - (startOpacity * progress);
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = 0;
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(fade);
    },
    
    slideUp(element, duration = 300) {
        element.style.overflow = 'hidden';
        element.style.height = element.offsetHeight + 'px';
        element.style.transition = `height ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.height = '0px';
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.transition = '';
                element.style.overflow = '';
            }, duration);
        }, 10);
    },
    
    slideDown(element, duration = 300) {
        element.style.display = 'block';
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.height = height + 'px';
            setTimeout(() => {
                element.style.height = '';
                element.style.transition = '';
                element.style.overflow = '';
            }, duration);
        }, 10);
    }
};

// Make utilities available globally
window.DOM = DOM;
window.HTTP = HTTP;
window.Storage = Storage;
window.Validate = Validate;
window.Format = Format;
window.Animate = Animate;