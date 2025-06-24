const { spawn } = require('child_process');
const geoip = require('geoip-lite');
const fs = require('fs');

let sshPorts = [22]; // fallback
try {
  const config = fs.readFileSync('/etc/ssh/sshd_config', 'utf8');
  sshPorts = Array.from(config.matchAll(/^Port\s+(\d+)/gm)).map(m => parseInt(m[1], 10));
  if (sshPorts.length === 0) sshPorts = [22];
} catch (err) {
  console.error('?? Failed to read sshd_config, defaulting to port 22');
}

function init(emitter) {
  const journal = spawn('journalctl', ['-u', 'ssh', '-f', '-n', '0']);

  journal.stdout.on('data', (data) => {
    const line = data.toString();
    const match = line.match(/Failed password for (\S+) from ([\d.:a-f]+) port (\d+)/i);
    if (!match) return;

    const username = match[1];
    const ip = match[2];
    const port = sshPorts[0]; // Use first declared SSH port
    let geo = geoip.lookup(ip);

    if (!geo && (ip === '127.0.0.1' || ip === '::1')) {
      geo = {
        country: 'ZZ',
        city: 'Localhost',
        ll: [53.814, -3.055]
      };
    }
    if (!geo) return;

    emitter.emit('attack', {
      origin: geo.country || "??",
      dest: "GB",
      type: "SSH login attempt",
      ip,
      city: geo.city || "Unknown",
      line: line.trim(),
      service: "ssh",
      port,
      username
    });
  });

  journal.stderr.on('data', data => {
    console.error(`ssh stderr: ${data}`);
  });

  journal.on('close', code => {
    console.log(`ssh journalctl exited with code ${code}`);
  });
}

module.exports = { init };
