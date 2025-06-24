const WebSocket = require('ws');
const { spawn } = require('child_process');
const geoip = require('geoip-lite');

const wss = new WebSocket.Server({ port: 8001 });

console.log('? WebSocket server started on ws://0.0.0.0:8001');

// When a client connects
wss.on('connection', ws => {
  console.log('?? Client connected');
});

// Spawn journald stream (live SSH logs)
const journal = spawn('journalctl', ['-u', 'ssh', '-f', '-n', '0']);

journal.stdout.on('data', (data) => {
  const line = data.toString();
  console.log("LINE:", line); // Debug log

  // Match "Failed password for <user> from <IP> port <port> ..."
  const match = line.match(/Failed password for (\S+) from ([\d.:a-f]+) port (\d+)/i);
  if (!match) return;

  const username = match[1];
  const ip = match[2];
  const port = match[3];

  let geo = geoip.lookup(ip);

  // Handle localhost / internal testing
  if (!geo && (ip === '::1' || ip === '127.0.0.1')) {
    geo = {
      country: 'ZZ',
      city: 'Localhost',
      ll: [53.814, -3.055] // Fake lat/lon (Blackpool area for you)
    };
  }

  if (!geo) return; // Still no location? Skip it

  const payload = {
    origin: geo.country || "??",
    dest: "GB", // You can change this if needed
    type: "SSH login attempt",
    ip: ip,
    city: geo.city || "Unknown",
    line: line.trim(),
    service: "ssh",           // fixed as SSH since you parse ssh logs
    port: port,
    username: username
  };

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });

  console.log(`?? Sent attack from ${ip} (${geo.country}) user=${username} port=${port}`);
});

journal.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

journal.on('close', (code) => {
  console.log(`? journalctl process exited with code ${code}`);
});
