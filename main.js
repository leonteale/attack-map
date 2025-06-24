const WebSocket = require('ws');
const fs = require('fs');
require('./statsGenerator');
const path = require('path');
const EventEmitter = require('events');
const emitter = new EventEmitter();


const wss = new WebSocket.Server({ port: 8001 });
console.log('?? WebSocket server listening on ws://0.0.0.0:8001');

// Helper: log to file with timestamp
const logToFile = (text) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('log.txt', `[${timestamp}] ${text}\n`);
};

// Broadcast and log incoming attacks
emitter.on('attack', (payload) => {
  const {
    ip, origin, dest, type, city, username, service, port
  } = payload;

  const timestamp = new Date().toISOString();
  const country = origin || '??';
  const location = city || 'Unknown';
  const user = username || 'unknown';
  const svc = service || 'unknown';
  const prt = port || '??';

  const logLine = `${ip} (${country}/${location}) attempted ${type} on port ${prt} as user '${user}' via ${svc}`;

  // Console
  console.log(`[${timestamp}] ${logLine}`);

  // File
  logToFile(logLine);

  // Send to browser client
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
});

// Load all parsers from /parsers
const parsersDir = path.join(__dirname, 'parsers');
fs.readdirSync(parsersDir)
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const parser = require(path.join(parsersDir, file));
    parser.init(emitter);
    console.log(`? Loaded parser: ${file}`);
  });

wss.on('connection', () => {
  console.log('??? Client connected');
});
