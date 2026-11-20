/**
 * build-html.js
 * Standalone utility to assemble HTML components into index.html
 * Can be run anytime via `npm run build:html` or `node build-html.js`.
 */

import fs from 'fs';
import path from 'path';

const templatePath = path.resolve(process.cwd(), 'index.template.html');
const outputPath = path.resolve(process.cwd(), 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('Template index.template.html not found!');
  process.exit(1);
}

let html = fs.readFileSync(templatePath, 'utf-8');
const includeRegex = /<(?:include|component)\s+src=["']([^"']+)["']\s*(?:\/>|>\s*<\/(?:include|component)>)/gi;

html = html.replace(includeRegex, (match, srcPath) => {
  const resolvedPath = path.resolve(process.cwd(), srcPath);
  if (fs.existsSync(resolvedPath)) {
    return fs.readFileSync(resolvedPath, 'utf-8');
  }
  console.warn(`File not found: ${resolvedPath}`);
  return match;
});

fs.writeFileSync(outputPath, html, 'utf-8');
console.log('Successfully assembled components into index.html!');
