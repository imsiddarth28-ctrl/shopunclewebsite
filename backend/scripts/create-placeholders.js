const fs = require('fs');
const path = require('path');

const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

const files = [
  // Categories
  'categories/frames.jpg',
  'categories/personalized.jpg',
  'categories/mugs.jpg',
  'categories/canvas.jpg',
  'categories/keychains.jpg',
  'categories/photobooks.jpg',
  'categories/cushions.jpg',
  'categories/clocks.jpg',
  'categories/cases.jpg',
  
  // Frames
  'frames/classic-wood.jpg',
  'frames/classic-wood-thumb.jpg',
  'frames/modern-metal.jpg',
  'frames/modern-metal-thumb.jpg',
  'frames/acrylic-float.jpg',
  'frames/acrylic-float-thumb.jpg',
  
  // Textures
  'textures/wood-oak.jpg',
  'textures/wood-walnut.jpg',
  'textures/wood-mahogany.jpg',
  'textures/wood-teak.jpg',
  'textures/metal-silver.jpg',
  'textures/metal-black.jpg',
  'textures/metal-rose-gold.jpg',
  'textures/metal-gold.jpg',
  'textures/acrylic-clear.jpg',
  'textures/acrylic-frosted.jpg',
  'textures/acrylic-gray.jpg',
  
  // Products
  'products/frame-1.jpg',
  'products/frame-1-2.jpg',
  'products/frame-1-3.jpg',
  'products/frame-2.jpg',
  'products/frame-2-2.jpg',
  'products/frame-2-3.jpg',
  'products/frame-3.jpg',
  'products/frame-3-2.jpg',
  'products/frame-3-3.jpg',
  'products/mug-1.jpg',
  'products/mug-1-2.jpg',
  'products/canvas-1.jpg',
  'products/canvas-1-2.jpg',
  'products/keychain-1.jpg',
  'products/keychain-1-2.jpg',
];

const publicDir = path.join(__dirname, '../public');

console.log('Generating placeholder assets...');

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  const dirPath = path.dirname(filePath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${file}`);
});

console.log('✅ All placeholder assets generated successfully!');
