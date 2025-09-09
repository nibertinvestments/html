# Project Guidelines

This document outlines best practices and guidelines for creating and maintaining HTML projects in this repository.

## Project Organization

### Naming Conventions

- **Project folders**: Use lowercase with hyphens (e.g., `my-awesome-project`)
- **Files**: Use lowercase with hyphens (e.g., `contact-form.html`)
- **CSS classes**: Use BEM methodology or consistent naming
- **JavaScript variables**: Use camelCase
- **Constants**: Use UPPER_SNAKE_CASE

### File Structure

Each project should follow this structure:

```
project-name/
├── index.html              # Main entry point
├── README.md              # Project documentation
├── css/
│   ├── style.css          # Main styles
│   └── components/        # Component-specific styles (optional)
├── js/
│   ├── main.js            # Main JavaScript
│   └── modules/           # JavaScript modules (optional)
├── assets/
│   ├── images/            # Images
│   ├── fonts/             # Custom fonts
│   └── icons/             # Icons and graphics
└── docs/                  # Additional documentation (optional)
```

## HTML Guidelines

### Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Clear, concise description">
    <meta name="author" content="Your Name">
    <title>Descriptive Page Title</title>
    
    <!-- Shared CSS first -->
    <link rel="stylesheet" href="../../shared/css/normalize.css">
    <link rel="stylesheet" href="../../shared/css/base.css">
    
    <!-- Project-specific CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Content -->
    
    <!-- Shared JS first -->
    <script src="../../shared/js/utils.js"></script>
    
    <!-- Project-specific JS -->
    <script src="js/main.js"></script>
</body>
</html>
```

### Semantic HTML

- Use appropriate HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- Use headings (`h1-h6`) in logical order
- Use lists (`<ul>`, `<ol>`) for grouped content
- Use `<button>` for interactive elements, not `<div>` or `<span>`

### Accessibility

- Include `alt` attributes for all images
- Use proper heading hierarchy
- Ensure sufficient color contrast
- Include ARIA labels when needed
- Make forms accessible with proper labels
- Test with keyboard navigation

## CSS Guidelines

### Organization

```css
/* 1. CSS Custom Properties (Variables) */
:root {
    --primary-color: #007bff;
    --font-family: 'Arial', sans-serif;
}

/* 2. Base Elements */
body, html { /* ... */ }

/* 3. Layout Components */
.header { /* ... */ }
.main { /* ... */ }
.footer { /* ... */ }

/* 4. UI Components */
.button { /* ... */ }
.card { /* ... */ }

/* 5. Utilities */
.text-center { /* ... */ }
.mb-3 { /* ... */ }

/* 6. Media Queries */
@media (max-width: 768px) { /* ... */ }
```

### Best Practices

- Use CSS custom properties for consistent values
- Follow mobile-first responsive design
- Use flexbox and grid for layouts
- Avoid `!important` unless absolutely necessary
- Use relative units (`rem`, `em`, `%`, `vw`, `vh`) when appropriate
- Keep specificity low

### Naming Convention (BEM)

```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__body { }

/* Modifier */
.card--large { }
.card__header--dark { }
```

## JavaScript Guidelines

### Code Organization

```javascript
// 1. Constants and configuration
const CONFIG = {
    API_URL: 'https://api.example.com',
    TIMEOUT: 5000
};

// 2. Utility functions
function formatDate(date) { }

// 3. Main application logic
class MyApplication {
    constructor() { }
    init() { }
}

// 4. Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
    const app = new MyApplication();
    app.init();
});
```

### Best Practices

- Use `const` and `let` instead of `var`
- Use arrow functions appropriately
- Handle errors with try-catch blocks
- Use async/await for asynchronous operations
- Validate user input
- Use the shared utility functions when possible

### Using Shared Utilities

```javascript
// DOM manipulation
const element = DOM.$('#my-element');
DOM.on('.buttons', 'click', handleButtonClick);

// HTTP requests
try {
    const data = await HTTP.get('/api/users');
    console.log(data);
} catch (error) {
    console.error('Failed to fetch users:', error);
}

// Local storage
Storage.set('user-preferences', { theme: 'dark' });
const preferences = Storage.get('user-preferences', {});

// Validation
if (!Validate.email(emailInput.value)) {
    showError('Please enter a valid email address');
}

// Formatting
const price = Format.currency(29.99);
const date = Format.date(new Date());
```

## Performance Guidelines

### Images

- Optimize images for web (use appropriate formats: JPEG for photos, PNG for graphics, SVG for icons)
- Include `width` and `height` attributes to prevent layout shift
- Use responsive images with `srcset` when appropriate
- Consider lazy loading for images below the fold

### CSS

- Minimize CSS file size
- Use CSS sprites for small icons (or prefer SVG)
- Avoid inline styles
- Use CSS minification for production

### JavaScript

- Minimize JavaScript file size
- Avoid inline JavaScript
- Use event delegation for dynamic content
- Debounce expensive operations (scroll, resize, input)

## Browser Compatibility

### Target Browsers

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Testing

- Test in multiple browsers and devices
- Use browser developer tools
- Validate HTML and CSS
- Check for console errors

## Version Control

### Git Practices

- Use meaningful commit messages
- Commit frequently with logical changes
- Don't commit built/generated files
- Use `.gitignore` appropriately

### Commit Message Format

```
type: brief description

Longer description if needed explaining what and why
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Documentation

### Project README

Each project should include a README.md with:

- Project description and purpose
- Setup and installation instructions
- Usage examples
- Technologies used
- Author information
- License information

### Code Comments

- Document complex logic
- Explain why, not what
- Keep comments up to date
- Use JSDoc for JavaScript functions

```javascript
/**
 * Calculates the total price including tax
 * @param {number} basePrice - The base price before tax
 * @param {number} taxRate - The tax rate (e.g., 0.08 for 8%)
 * @returns {number} The total price including tax
 */
function calculateTotal(basePrice, taxRate) {
    return basePrice * (1 + taxRate);
}
```

## Quality Assurance

### Code Review Checklist

- [ ] HTML is semantic and accessible
- [ ] CSS follows naming conventions
- [ ] JavaScript follows best practices
- [ ] Code is properly documented
- [ ] No console errors
- [ ] Works on mobile devices
- [ ] Fast loading times
- [ ] Cross-browser compatibility

### Tools

Use the provided npm scripts for quality checks:

```bash
npm run lint      # Check code quality
npm run validate  # Validate HTML
npm run format    # Format code
npm run build     # Run all checks
```

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

Remember: These guidelines are here to help maintain consistency and quality across all projects. When in doubt, refer to these guidelines or ask for help!