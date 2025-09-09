# Getting Started with HTML Projects

Welcome to the HTML Projects repository! This guide will help you get started with creating and managing multiple HTML projects in a structured environment.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- A code editor (VS Code, Sublime Text, etc.)
- A modern web browser

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Create your first project:**
   ```bash
   npm run new-project
   ```

## Directory Structure

```
├── projects/              # Your HTML projects
│   ├── template/          # Template for new projects
│   └── [your-projects]/   # Individual project folders
├── shared/                # Shared resources
│   ├── css/              # Shared stylesheets
│   ├── js/               # Shared JavaScript utilities
│   └── assets/           # Shared images, fonts, etc.
├── docs/                 # Documentation
└── tools/                # Development tools
```

## Creating a New Project

The easiest way to create a new project is using the project generator:

```bash
npm run new-project
```

This will:
- Ask for project details (name, title, description, author)
- Create a project folder with the standard structure
- Copy and customize template files
- Generate a project-specific README

### Manual Project Creation

If you prefer to create projects manually:

1. Create a new folder in `projects/`
2. Copy the template files from `projects/template/`
3. Customize the HTML, CSS, and JavaScript files
4. Update the project title and metadata

## Project Structure

Each project should follow this structure:

```
your-project/
├── index.html           # Main HTML file
├── css/
│   └── style.css       # Project-specific styles
├── js/
│   └── main.js         # Project-specific JavaScript
├── assets/             # Images, fonts, etc.
└── README.md           # Project documentation
```

## Using Shared Resources

All projects can leverage shared resources:

### CSS
- `shared/css/normalize.css` - Cross-browser reset
- `shared/css/base.css` - Common styles and utilities

### JavaScript
- `shared/js/utils.js` - Utility functions for:
  - DOM manipulation
  - HTTP requests
  - Local storage
  - Form validation
  - Animations
  - Formatting

### Example Usage

```html
<!-- In your HTML -->
<link rel="stylesheet" href="../../shared/css/normalize.css">
<link rel="stylesheet" href="../../shared/css/base.css">
<script src="../../shared/js/utils.js"></script>
```

```javascript
// In your JavaScript
// Use DOM utilities
const button = DOM.$('#my-button');
DOM.on(button, 'click', handleClick);

// Use HTTP utilities
const data = await HTTP.get('/api/data');

// Use storage utilities
Storage.set('user-preferences', { theme: 'dark' });
```

## Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Create a new project:**
   ```bash
   npm run new-project
   ```

3. **Lint your code:**
   ```bash
   npm run lint
   ```

4. **Format your code:**
   ```bash
   npm run format
   ```

5. **Validate HTML:**
   ```bash
   npm run validate
   ```

## Best Practices

1. **Use semantic HTML** - Choose HTML elements based on meaning, not appearance
2. **Write accessible code** - Use proper ARIA labels and semantic structure
3. **Keep it responsive** - Design for mobile-first, then enhance for larger screens
4. **Organize your code** - Keep HTML, CSS, and JavaScript in separate files
5. **Use shared resources** - Don't duplicate common functionality
6. **Test across browsers** - Ensure compatibility with major browsers
7. **Optimize performance** - Minimize HTTP requests and optimize images

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Make sure Node.js is installed
   - Run `npm install` to install dependencies
   - Check if port 3000 is available

2. **Styles not loading**
   - Check file paths in your HTML
   - Ensure CSS files exist in the correct location
   - Check browser console for 404 errors

3. **JavaScript errors**
   - Check browser console for error messages
   - Ensure script files are loaded before use
   - Check for typos in function names

### Getting Help

- Check the [project guidelines](project-guidelines.md)
- Browse [web development resources](web-development-resources.md)
- Use browser developer tools for debugging
- Run `npm run help` for quick reference

## Next Steps

1. Read the [Project Guidelines](project-guidelines.md)
2. Explore [Web Development Resources](web-development-resources.md)
3. Look at the template project for examples
4. Start building your first project!

Happy coding! 🎉