#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function createProject() {
    console.log('🚀 HTML Project Creator\n');
    
    const projectName = await askQuestion('Enter project name (lowercase, no spaces): ');
    const projectTitle = await askQuestion('Enter project title (display name): ');
    const projectDescription = await askQuestion('Enter project description: ');
    const authorName = await askQuestion('Enter author name: ');
    
    const projectPath = path.join(__dirname, '../../projects', projectName);
    
    if (fs.existsSync(projectPath)) {
        console.log(`❌ Project "${projectName}" already exists!`);
        rl.close();
        return;
    }
    
    try {
        // Create project directory structure
        fs.mkdirSync(projectPath, { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'css'), { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'js'), { recursive: true });
        fs.mkdirSync(path.join(projectPath, 'assets'), { recursive: true });
        
        // Read template files
        const templatePath = path.join(__dirname, '../../projects/template');
        const templateHtml = fs.readFileSync(path.join(templatePath, 'index.html'), 'utf8');
        const templateCss = fs.readFileSync(path.join(templatePath, 'css/style.css'), 'utf8');
        const templateJs = fs.readFileSync(path.join(templatePath, 'js/main.js'), 'utf8');
        
        // Customize template content
        const customHtml = templateHtml
            .replace('Project Title', projectTitle)
            .replace('Your project description here', projectDescription)
            .replace('Your name', authorName)
            .replace('Welcome to Your Project', `Welcome to ${projectTitle}`)
            .replace('This is a template for your HTML projects. Replace this content with your own.', 
                     projectDescription);
        
        const customJs = templateJs
            .replace('Project loaded successfully!', `${projectTitle} loaded successfully!`);
        
        // Write customized files
        fs.writeFileSync(path.join(projectPath, 'index.html'), customHtml);
        fs.writeFileSync(path.join(projectPath, 'css', 'style.css'), templateCss);
        fs.writeFileSync(path.join(projectPath, 'js', 'main.js'), customJs);
        
        // Create README for the project
        const projectReadme = `# ${projectTitle}

${projectDescription}

## Getting Started

1. Open \`index.html\` in your browser
2. Or use the development server: \`npm run serve-project\` from the project directory

## Structure

- \`index.html\` - Main HTML file
- \`css/style.css\` - Project-specific styles
- \`js/main.js\` - Project-specific JavaScript
- \`assets/\` - Images, fonts, and other assets

## Development

This project uses shared resources from the repository:
- Shared CSS from \`../../shared/css/\`
- Shared JavaScript utilities from \`../../shared/js/\`

## Author

${authorName}
`;
        
        fs.writeFileSync(path.join(projectPath, 'README.md'), projectReadme);
        
        console.log(`\n✅ Project "${projectName}" created successfully!`);
        console.log(`📁 Location: ${projectPath}`);
        console.log(`\nNext steps:`);
        console.log(`1. cd projects/${projectName}`);
        console.log(`2. Open index.html in your browser`);
        console.log(`3. Or run: npm run serve-project`);
        console.log(`4. Start coding! 🎉\n`);
        
    } catch (error) {
        console.error('❌ Error creating project:', error.message);
    }
    
    rl.close();
}

createProject();