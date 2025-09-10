// Zingiestsnail98 Directory Websites - Professional Interactive JavaScript
// Handles smooth animations, form validation, and enhanced user experience

'use strict';

// Main application object
const ZingiestSnail = {
    // Configuration
    config: {
        animationDuration: 400,
        scrollOffset: 100,
        debounceDelay: 300,
        maxMessageLength: 750
    },
    
    // State management
    state: {
        isInitialized: false,
        activeAnimations: new Set(),
        formSubmitted: false
    },
    
    // Initialize the application
    init() {
        if (this.state.isInitialized) return;
        
        this.setupSmoothScrolling();
        this.enhanceNavigation();
        this.initializeContactForm();
        this.setupAnimations();
        this.enhanceAccessibility();
        
        this.state.isInitialized = true;
        this.log('ZingiestSnail application initialized successfully');
    },
    
    // Setup smooth scrolling for internal links
    setupSmoothScrolling() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (link) {
                event.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    },
    
    // Enhance navigation with active states and hover effects
    enhanceNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // Set active state based on current page
            if (linkHref === currentPage || 
                (currentPage === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
            
            // Enhanced hover effects
            link.addEventListener('mouseenter', this.handleNavHover.bind(this));
            link.addEventListener('mouseleave', this.handleNavLeave.bind(this));
        });
    },
    
    // Handle navigation hover effects
    handleNavHover(event) {
        const link = event.target;
        if (!link.classList.contains('active')) {
            link.style.transform = 'translateY(-3px) scale(1.05)';
            link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    },
    
    // Handle navigation leave effects
    handleNavLeave(event) {
        const link = event.target;
        if (!link.classList.contains('active')) {
            link.style.transform = '';
        }
    },
    
    // Initialize contact form functionality
    initializeContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');
        const submitBtn = document.getElementById('submit-btn');
        const formStatus = document.getElementById('form-status');
        
        // Character counter for message
        if (messageTextarea) {
            this.setupCharacterCounter(messageTextarea);
        }
        
        // Form validation
        const inputs = [nameInput, emailInput, subjectInput, messageTextarea].filter(Boolean);
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
        
        // Form submission
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleFormSubmission(form, {
                nameInput,
                emailInput,
                subjectInput,
                messageTextarea,
                submitBtn,
                formStatus
            });
        });
    },
    
    // Setup character counter for message textarea
    setupCharacterCounter(textarea) {
        const counterContainer = document.createElement('div');
        counterContainer.className = 'char-counter';
        counterContainer.innerHTML = '<span id="char-count">0</span>/' + this.config.maxMessageLength + ' characters';
        
        const formGroup = textarea.closest('.form-group');
        if (formGroup) {
            formGroup.appendChild(counterContainer);
        }
        
        const charCount = document.getElementById('char-count');
        
        textarea.addEventListener('input', () => {
            const currentLength = textarea.value.length;
            charCount.textContent = currentLength;
            
            // Update styling based on character count
            if (currentLength > this.config.maxMessageLength - 50) {
                charCount.style.color = '#dc2626';
                charCount.style.fontWeight = '600';
                counterContainer.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                counterContainer.style.padding = '4px 8px';
                counterContainer.style.borderRadius = '6px';
            } else if (currentLength > this.config.maxMessageLength - 100) {
                charCount.style.color = '#f59e0b';
                charCount.style.fontWeight = '500';
                counterContainer.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                counterContainer.style.padding = '4px 8px';
                counterContainer.style.borderRadius = '6px';
            } else {
                charCount.style.color = 'var(--text-muted)';
                charCount.style.fontWeight = '400';
                counterContainer.style.backgroundColor = 'transparent';
                counterContainer.style.padding = '0';
            }
        });
    },
    
    // Validate individual form field
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type || field.tagName.toLowerCase();
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (fieldType === 'email' && value) {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (field.id === 'message' && value.length > this.config.maxMessageLength) {
            // Message length validation
            isValid = false;
            errorMessage = `Message must not exceed ${this.config.maxMessageLength} characters`;
        }
        
        // Update field styling and show/hide error message
        if (isValid) {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            this.removeFieldError(field);
        } else {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    },
    
    // Show field error message
    showFieldError(field, message) {
        this.removeFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideIn 0.3s ease;
        `;
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.appendChild(errorElement);
        }
    },
    
    // Remove field error message
    removeFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            const existingError = formGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        }
    },
    
    // Handle form submission
    handleFormSubmission(form, elements) {
        const { nameInput, emailInput, subjectInput, messageTextarea, submitBtn, formStatus } = elements;
        
        // Prevent double submission
        if (this.state.formSubmitted) return;
        
        // Validate all fields
        const fields = [nameInput, emailInput, subjectInput, messageTextarea].filter(Boolean);
        const validationResults = fields.map(field => this.validateField(field));
        const isFormValid = validationResults.every(result => result);
        
        if (!isFormValid) {
            this.showFormStatus('Please correct the errors above before submitting.', 'error', formStatus);
            return;
        }
        
        // Collect form data
        const formData = {
            name: nameInput?.value.trim() || '',
            email: emailInput?.value.trim() || '',
            subject: subjectInput?.value.trim() || '',
            message: messageTextarea?.value.trim() || ''
        };
        
        // Show loading state
        this.setLoadingState(submitBtn, true);
        this.state.formSubmitted = true;
        
        // Create email content
        const emailSubject = `Zingiestsnail98 Directory Contact: ${formData.subject}`;
        const emailBody = this.formatEmailBody(formData);
        
        // Create mailto link
        const mailtoLink = `mailto:josh@nibertelectronics.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Simulate processing delay for better UX
        setTimeout(() => {
            try {
                // Open email client
                window.location.href = mailtoLink;
                
                // Reset form and show success message
                this.resetForm(form);
                this.setLoadingState(submitBtn, false);
                this.showFormStatus(
                    'Your email client has been opened with the message pre-filled. Please send the email to complete your inquiry. Thank you for contacting us!',
                    'success',
                    formStatus
                );
                
                // Reset submission state after delay
                setTimeout(() => {
                    this.state.formSubmitted = false;
                }, 3000);
                
                // Auto-hide success message
                setTimeout(() => {
                    if (formStatus) formStatus.innerHTML = '';
                }, 12000);
                
            } catch (error) {
                this.setLoadingState(submitBtn, false);
                this.state.formSubmitted = false;
                this.showFormStatus(
                    'There was an issue opening your email client. Please try again or send an email directly to josh@nibertelectronics.com',
                    'error',
                    formStatus
                );
                this.log('Error opening email client:', error);
            }
        }, 1000);
    },
    
    // Format email body content
    formatEmailBody(formData) {
        return `Hello,

I'm contacting you through the Zingiestsnail98 Directory Websites contact form.

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
This message was sent via the Zingiestsnail98 Directory Websites contact form
Website: ${window.location.origin}
Timestamp: ${new Date().toLocaleString()}`;
    },
    
    // Reset form to initial state
    resetForm(form) {
        form.reset();
        
        // Reset character counter
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = '0';
            charCount.style.color = 'var(--text-muted)';
            charCount.style.fontWeight = '400';
            
            const counterContainer = charCount.closest('.char-counter');
            if (counterContainer) {
                counterContainer.style.backgroundColor = 'transparent';
                counterContainer.style.padding = '0';
            }
        }
        
        // Remove error states
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            this.removeFieldError(field);
        });
    },
    
    // Set loading state for submit button
    setLoadingState(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span>Sending...</span>';
            button.style.opacity = '0.8';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.innerHTML = '<span>Send Message</span>';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    },
    
    // Show form status message
    showFormStatus(message, type, statusContainer) {
        if (!statusContainer) return;
        
        const statusClass = type === 'success' ? 'status-success' : 'status-error';
        const icon = type === 'success' ? '✅' : '❌';
        
        statusContainer.innerHTML = `
            <div class="status-message ${statusClass}">
                <span class="status-icon">${icon}</span>
                <span class="status-text">${message}</span>
            </div>
        `;
        
        // Smooth scroll to status message
        statusContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        // Auto-hide error messages
        if (type === 'error') {
            setTimeout(() => {
                statusContainer.innerHTML = '';
            }, 10000);
        }
    },
    
    // Setup entrance animations
    setupAnimations() {
        // Animate content sections on scroll
        this.observeScrollAnimations();
        
        // Animate directory links on load
        const directoryLinks = document.querySelectorAll('.directory-link');
        directoryLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                link.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Add hover animations to directory links
        this.enhanceDirectoryLinks();
    },
    
    // Enhance directory links with advanced hover effects
    enhanceDirectoryLinks() {
        const directoryLinks = document.querySelectorAll('.directory-link');
        
        directoryLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                link.style.transform = 'translateY(-6px) scale(1.03)';
                link.style.zIndex = '10';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
                link.style.zIndex = '';
            });
            
            link.addEventListener('click', () => {
                link.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            });
        });
    },
    
    // Observe elements for scroll-triggered animations
    observeScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(40px)';
                section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                observer.observe(section);
            });
        }
    },
    
    // Enhance accessibility
    enhanceAccessibility() {
        // Add skip link
        this.addSkipLink();
        
        // Enhance keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add ARIA live region for announcements
        this.setupLiveRegion();
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
            background: var(--metallic-green);
            color: white;
            padding: 8px 12px;
            text-decoration: none;
            border-radius: 6px;
            z-index: 1000;
            transition: top 0.3s ease;
            font-weight: 600;
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
            mainContent.setAttribute('tabindex', '-1');
        }
    },
    
    // Setup keyboard navigation enhancements
    setupKeyboardNavigation() {
        // Enhanced focus management
        document.addEventListener('keydown', (event) => {
            // Escape key to close any modal-like elements
            if (event.key === 'Escape') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.blur) {
                    activeElement.blur();
                }
            }
        });
    },
    
    // Setup live region for screen reader announcements
    setupLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    },
    
    // Announce message to screen readers
    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
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
    
    // Utility: Logging function
    log(...args) {
        /* eslint-disable no-console */
        if (console && console.log) {
            console.log('[ZingiestSnail]', ...args);
        }
        /* eslint-enable no-console */
    }
};

// Global error handling
window.addEventListener('error', (event) => {
    ZingiestSnail.log('Error:', event.error);
    // Graceful degradation - ensure basic functionality still works
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ZingiestSnail.init());
} else {
    ZingiestSnail.init();
}

// Make available globally for debugging
window.ZingiestSnail = ZingiestSnail;

// Export for testing environments
/* eslint-env node */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ZingiestSnail;
}