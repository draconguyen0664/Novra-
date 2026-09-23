import fs from 'node:fs/promises';
import sharp from 'sharp';

const target = 'public/opengraph-image.jpg';
const source = await fs.readFile(target);
await sharp(source).jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toFile('public/opengraph-image-final.jpg');
await fs.rename('public/opengraph-image-final.jpg', target);
console.log('Created 1200×630 JPEG social image');
