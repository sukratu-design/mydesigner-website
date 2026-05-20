const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 4181);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function safeJoin(root, requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(root, normalizedPath);
  return filePath.startsWith(root) ? filePath : null;
}

function findFile(urlPath) {
  const cleanPath = urlPath.replace(/\/+$/, '') || '/';
  const candidates = [];

  if (cleanPath === '/') {
    candidates.push('/index.html');
  } else {
    candidates.push(cleanPath);
    candidates.push(`${cleanPath}.html`);
    candidates.push(`${cleanPath}/index.html`);
  }

  for (const candidate of candidates) {
    const filePath = safeJoin(ROOT, candidate);
    if (!filePath) continue;

    try {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) return filePath;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname.startsWith('/locations/')) {
    res.writeHead(301, { Location: '/services' });
    res.end();
    return;
  }

  const filePath = findFile(requestUrl.pathname);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview server running at http://127.0.0.1:${PORT}`);
});
