// generateProjectSnapshot.js
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname; // Assumes script is in project root

const excludedDirs = ['node_modules', 'dist', '.next', 'out', '.git', 'coverage'];
const excludedFiles = ['.env', '.DS_Store','pnpm-lock.yaml']; // Add specific files to exclude
const includedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.md', '.css', '.html', '.yaml', '.yml'];

function getProjectStructure(dir, indent = '') {
    let structure = '';
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relPath = path.relative(projectRoot, fullPath);

        if (excludedDirs.includes(file) || excludedFiles.includes(file)) {
            return;
        }
        // Skip files starting with .env but allow .env.example
        if (file.startsWith('.env') && file !== '.env.example' && file !== '.env.local.example') {
            return;
        }


        if (fs.statSync(fullPath).isDirectory()) {
            structure += `${indent}├── ${file}/\n`;
            structure += getProjectStructure(fullPath, indent + '│   ');
        } else {
            const ext = path.extname(file);
            if (includedExtensions.includes(ext)) {
                structure += `${indent}├── ${file}\n`;
            }
        }
    });
    return structure;
}

function getFileContents(dir) {
    let contents = '';
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relPath = path.relative(projectRoot, fullPath);

        if (excludedDirs.includes(file) || excludedFiles.includes(file)) {
            return;
        }
        if (file.startsWith('.env') && file !== '.env.example' && file !== '.env.local.example') {
            return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            contents += getFileContents(fullPath);
        } else {
            const ext = path.extname(file);
            if (includedExtensions.includes(ext)) {
                contents += `\n--- FILE: ${relPath} ---\n`;
                try {
                    contents += fs.readFileSync(fullPath, 'utf-8');
                } catch (e) {
                    contents += `Error reading file: ${e.message}\n`;
                }
                contents += `\n--- END FILE: ${relPath} ---\n`;
            }
        }
    });
    return contents;
}

console.log("--- PROJECT STRUCTURE ---");
console.log(getProjectStructure(projectRoot));
console.log("\n\n--- FILE CONTENTS ---");
console.log(getFileContents(projectRoot));

// To save to a file:
// const output = "--- PROJECT STRUCTURE ---\n" + getProjectStructure(projectRoot) + "\n\n--- FILE CONTENTS ---\n" + getFileContents(projectRoot);
// fs.writeFileSync('project_snapshot.txt', output, 'utf-8');
// console.log("\nSnapshot written to project_snapshot.txt");
// run this script from root with node generateProjectSnapshot.js > project_snapshot.txt