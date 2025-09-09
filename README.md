# HTML Projects Repository

A structured environment for housing multiple HTML projects with shared resources, development tools, and learning materials. Perfect for organizing web development projects and creating a consistent development workflow.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Create your first project:**
   ```bash
   npm run new-project
   ```

4. **Get help:**
   ```bash
   npm run help
   ```

## 📁 Directory Structure

```
├── projects/              # All your HTML projects
│   ├── template/          # Project template with modern HTML5 boilerplate
│   └── stockmarketdirectory/  # Example project
├── shared/                # Shared resources across all projects
│   ├── css/              # Normalize.css, base styles, utilities
│   ├── js/               # Utility functions (DOM, HTTP, storage, etc.)
│   └── assets/           # Shared images, fonts, icons
├── docs/                 # Documentation and learning resources
│   ├── getting-started.md
│   ├── project-guidelines.md
│   └── web-development-resources.md
├── tools/                # Development tools and scripts
│   └── scripts/          # Project creation and optimization scripts
└── package.json          # Development dependencies and scripts
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with live reload |
| `npm run serve` | Start server and open projects directory |
| `npm run new-project` | Create a new project from template |
| `npm run lint` | Lint HTML, CSS, and JavaScript files |
| `npm run format` | Format CSS and JavaScript files |
| `npm run validate` | Validate HTML files |
| `npm run build` | Run all quality checks |
| `npm run help` | Show detailed help guide |

## ✨ Features

### Project Templates
- Modern HTML5 boilerplate
- Responsive CSS with flexbox and grid
- JavaScript utilities and smooth scrolling
- Proper meta tags and accessibility features

### Shared Resources
- **CSS Reset & Base Styles**: Normalize.css and common utilities
- **JavaScript Utilities**: DOM manipulation, HTTP requests, storage, validation
- **Development Tools**: Live server, linting, formatting, validation

### Development Environment
- Live reloading development server
- Code quality tools (ESLint, Stylelint, HTMLHint)
- HTML validation
- Code formatting with Prettier
- Browser compatibility guidelines

### Learning Resources
- Comprehensive getting started guide
- Project guidelines and best practices
- Curated web development learning resources
- Code examples and templates

## 🎯 Creating a New Project

### Using the Generator (Recommended)
```bash
npm run new-project
```

The generator will ask for:
- Project name (lowercase, no spaces)
- Project title (display name)
- Project description
- Author name

### Manual Creation
1. Create a folder in `projects/`
2. Copy files from `projects/template/`
3. Customize the content and metadata
4. Start coding!

## 🔧 Shared Utilities

All projects can use powerful shared utilities:

### CSS Features
- Responsive grid system
- Utility classes for spacing, text alignment
- Card components and alerts
- CSS custom properties for theming

### JavaScript Utilities
```javascript
// DOM manipulation
const element = DOM.$('#my-element');
DOM.on('.buttons', 'click', handler);

// HTTP requests
const data = await HTTP.get('/api/endpoint');
await HTTP.post('/api/data', payload);

// Local storage
Storage.set('key', value);
const value = Storage.get('key', defaultValue);

// Validation
if (Validate.email(email)) { /* valid email */ }

// Formatting
const price = Format.currency(29.99);
const date = Format.date(new Date());

// Animations
Animate.fadeIn(element);
Animate.slideDown(element);
```

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Setup and first project
- **[Project Guidelines](docs/project-guidelines.md)** - Best practices and conventions
- **[Web Development Resources](docs/web-development-resources.md)** - Learning materials and tools

## 🎨 Example Projects

### Included Template
The `projects/template/` folder contains a fully functional example with:
- Semantic HTML5 structure
- Responsive navigation
- Smooth scrolling
- Modern CSS with custom properties
- JavaScript utilities integration

### Project Ideas
- Personal portfolio
- Landing pages
- Todo applications
- Weather apps
- E-commerce product pages
- Interactive dashboards

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## 🤝 Contributing

1. Follow the project guidelines
2. Use the linting and formatting tools
3. Test in multiple browsers
4. Document your code appropriately

## 📜 License

MIT License - feel free to use this structure for your own projects!

## 🆘 Getting Help

- Run `npm run help` for quick reference
- Check the documentation in the `docs/` folder
- Look at the template project for examples
- Use browser developer tools for debugging

---

**Happy coding!** 🎉 Start building amazing web projects with this structured, developer-friendly environment.
