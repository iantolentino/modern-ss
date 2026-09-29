/* A dependency-free static server for previewing the build.
   node serve.mjs [port]   →   http://127.0.0.1:4173/ */
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || 4173);

/* A sink for headless measurement pages: Chrome cannot write to stdout under
   the sandbox, so a probe page POSTs its findings here and they land on disk. */
const PROBE_SINK = path.join(ROOT, '_probe-result.txt');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/__probe' && req.method === 'POST') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      await writeFile(PROBE_SINK, Buffer.concat(chunks).toString('utf8'), 'utf8');
      res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
      return;
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[\\/])+/, ''));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }

    let target = file;
    try {
      const s = await stat(target);
      if (s.isDirectory()) target = path.join(target, 'index.html');
    } catch {
      const notFound = path.join(ROOT, '404.html');
      const body = await readFile(notFound).catch(() => Buffer.from('Not found'));
      res.writeHead(404, { 'content-type': TYPES['.html'] }).end(body);
      return;
    }

    const body = await readFile(target);
    res.writeHead(200, {
      'content-type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'content-length': body.length,
    }).end(body);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end('Server error: ' + e.message);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`strata-modern serving ${ROOT}`);
  console.log(`  http://127.0.0.1:${PORT}/`);
});
