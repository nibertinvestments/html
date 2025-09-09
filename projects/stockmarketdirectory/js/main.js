// Stock Market Directory JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Stock Market Directory loaded successfully!');
    
    // Initialize application
    initializeNavigation();
    initializeContactForm();
    initializeCTAButton();
    initializeAnimations();
});

/**
 * Initialize smooth scrolling navigation
 */
function initializeNavigation() {
    // Add smooth scrolling for navigation links
    const navLinks = DOM.$$('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        DOM.on(link, 'click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = DOM.$(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation
                DOM.setActiveClass('nav a', this, 'active');
            }
        });
    });
    
    // Update active navigation on scroll
    function updateActiveNav() {
        const sections = DOM.$$('section[id]');
        const navItems = DOM.$$('nav a[href^="#"]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Call once on load
}

/**
 * Initialize contact form with validation
 */
function initializeContactForm() {
    const form = DOM.$('.contact-form');
    
    if (!form) return;
    
    DOM.on(form, 'submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        // Validate form data
        if (!validateContactForm(data)) {
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showAlert('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Error sending message:', error);
            showAlert('Failed to send message. Please try again later.', 'danger');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

/**
 * Validate contact form data
 */
function validateContactForm(data) {
    let isValid = true;
    
    // Clear previous errors
    DOM.$$('.error-message').forEach(error => error.remove());
    
    // Validate name
    if (!Validate.required(data.name)) {
        showFieldError('name', 'Name is required');
        isValid = false;
    }
    
    // Validate email
    if (!Validate.required(data.email)) {
        showFieldError('email', 'Email is required');
        isValid = false;
    } else if (!Validate.email(data.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate message
    if (!Validate.required(data.message)) {
        showFieldError('message', 'Message is required');
        isValid = false;
    } else if (!Validate.minLength(data.message, 10)) {
        showFieldError('message', 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show field validation error
 */
function showFieldError(fieldName, message) {
    const field = DOM.$(`#${fieldName}`);
    if (!field) return;
    
    const errorDiv = DOM.create('div', {
        className: 'error-message',
        style: 'color: var(--danger-color); font-size: 0.875rem; margin-top: 0.25rem;'
    }, message);
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'var(--danger-color)';
    
    // Remove error on input
    DOM.on(field, 'input', function() {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    });
}

/**
 * Initialize CTA button functionality
 */
function initializeCTAButton() {
    const ctaButton = DOM.$('.cta-button');
    
    if (!ctaButton) return;
    
    DOM.on(ctaButton, 'click', function() {
        const resourcesSection = DOM.$('#resources');
        if (resourcesSection) {
            resourcesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

/**
 * Initialize scroll animations
 */
function initializeAnimations() {
    // Add fade-in animation for cards when they come into view
    const cards = DOM.$$('.card, .tool-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertDiv = DOM.create('div', {
        className: `alert alert-${type}`,
        style: `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `
    }, message);
    
    // Add close button
    const closeButton = DOM.create('button', {
        style: `
            background: none;
            border: none;
            float: right;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 1rem;
        `
    }, '×');
    
    DOM.on(closeButton, 'click', function() {
        alertDiv.remove();
    });
    
    alertDiv.appendChild(closeButton);
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);