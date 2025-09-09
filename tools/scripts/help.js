#!/usr/bin/env node

console.log(`
🌐 HTML Projects Repository - Help Guide
=======================================

📁 Directory Structure:
  ├── projects/              # All your HTML projects go here
  │   ├── template/          # Template for new projects
  │   └── your-project/      # Individual project folders
  ├── shared/                # Shared resources across projects
  │   ├── css/              # Shared stylesheets
  │   ├── js/               # Shared JavaScript utilities
  │   └── assets/           # Shared images, fonts, etc.
  ├── docs/                 # Documentation and guides
  └── tools/                # Development tools and scripts

🚀 Available Commands:
  npm run dev               # Start development server
  npm run serve             # Start server and open projects list
  npm run serve-project     # Serve current directory
  npm run new-project       # Create a new project from template
  npm run lint              # Lint HTML, CSS, and JS files
  npm run format            # Format CSS and JS files
  npm run validate          # Validate HTML files
  npm run build             # Run all checks (lint + validate)
  npm run help              # Show this help guide

📝 Creating a New Project:
  1. Run: npm run new-project
  2. Follow the prompts to enter project details
  3. Navigate to your project: cd projects/your-project-name
  4. Start coding!

🎨 Using Shared Resources:
  All projects can use shared CSS and JavaScript:
  - normalize.css: Cross-browser CSS reset
  - base.css: Common styles and utilities
  - utils.js: JavaScript utilities for DOM, HTTP, storage, etc.

📖 Learning Resources:
  Check the docs/ folder for:
  - getting-started.md: Quick start guide
  - project-guidelines.md: Best practices
  - web-development-resources.md: Learning materials

🔧 Development Tools:
  - Live reloading with live-server
  - HTML validation with html-validate
  - CSS linting with stylelint
  - JavaScript linting with eslint
  - Code formatting with prettier

💡 Tips:
  - Keep your projects organized in the projects/ folder
  - Use the shared resources to avoid duplicating code
  - Follow the established naming conventions
  - Test your projects in multiple browsers
  - Use semantic HTML and responsive design

📞 Need Help?
  - Check the documentation in the docs/ folder
  - Look at the template project for examples
  - Use browser developer tools for debugging

Happy coding! 🎉
`);