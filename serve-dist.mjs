import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT || 5202);
const root = resolve('dist');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function fileFor(url) {
  const requestPath = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const cleanPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const target = resolve(join(root, cleanPath));

  if (!target.startsWith(root)) return join(root, 'index.html');
  if (existsSync(target) && statSync(target).isFile()) return target;
  return join(root, 'index.html');
}

createServer((request, response) => {
  const file = fileFor(request.url);
  response.writeHead(200, {
    'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`c.s_studiobeauty online: http://localhost:${port}`);
});
