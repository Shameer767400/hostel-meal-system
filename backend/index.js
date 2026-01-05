// Minimal placeholder server
// Replace this with your Express/MongoDB app implementation.

const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hostel meal system backend placeholder. Replace index.js with your app.\n');
});

server.listen(PORT, () => {
  console.log(`Placeholder server running on http://localhost:${PORT}`);
  console.log('If this repository originally used Express/MongoDB, replace this file with the real server entry point.');
});
