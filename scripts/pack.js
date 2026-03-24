/**
 * Framer Plugin Pack Script
 * Creates a properly formatted plugin.zip for Framer submission
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read package.json for plugin metadata
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

// Create output stream
const outputPath = path.join(rootDir, 'plugin.zip');
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ plugin.zip created successfully (${(archive.pointer() / 1024).toFixed(2)} KB)`);
  console.log(`📦 Ready to upload to Framer!`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add dist folder contents (the built plugin)
archive.directory(path.join(rootDir, 'dist'), false);

// Add framer.json (required by Framer)
if (fs.existsSync(path.join(rootDir, 'framer.json'))) {
  archive.file(path.join(rootDir, 'framer.json'), { name: 'framer.json' });
}

// Add icon if it exists
const iconPath = path.join(rootDir, 'asset', 'icon.png');
if (fs.existsSync(iconPath)) {
  archive.file(iconPath, { name: 'icon.png' });
}

archive.finalize();
