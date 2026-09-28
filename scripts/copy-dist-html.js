import fs from 'node:fs';
import path from 'node:path';

const publicHtml = path.resolve('dist', 'public', 'index.html');
const distHtml = path.resolve('dist', 'index.html');

if (fs.existsSync(publicHtml)) {
  fs.copyFileSync(publicHtml, distHtml);
  console.log('[Build] Successfully mirrored index.html to dist/index.html');
}
