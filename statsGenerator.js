// statsGenerator.js
const fs = require('fs');
const path = require('path');

function parseLogs() {
  const logFile = path.join(__dirname, 'log.txt');
  const statsFile = path.join(__dirname, 'stats.json');

  if (!fs.existsSync(logFile)) return;

  const logs = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const allTime = { country: {}, ip: {}, service: {} };
  const today = { country: {}, ip: {}, service: {} };

  for (const line of logs) {
    const timestampMatch = line.match(/^\[(.*?)\]/);
    const ipMatch = line.match(/\] ([\d.]+)/);
    const countryMatch = line.match(/\(([^)]+)\)/);
    const serviceMatch = line.match(/via (\w+)$/);
  
    if (!timestampMatch || !ipMatch || !countryMatch || !serviceMatch) continue;
  
    const timestamp = timestampMatch[1];
    const ip = ipMatch[1];
    const country = countryMatch[1];
    const service = serviceMatch[1];
  
    const dateStr = timestamp.slice(0, 10); // "YYYY-MM-DD"
  
    // All-time
    allTime.country[country] = (allTime.country[country] || 0) + 1;
    allTime.ip[ip] = (allTime.ip[ip] || 0) + 1;
    allTime.service[service] = (allTime.service[service] || 0) + 1;
  
    // Today
    if (dateStr === todayStr) {
      today.country[country] = (today.country[country] || 0) + 1;
      today.ip[ip] = (today.ip[ip] || 0) + 1;
      today.service[service] = (today.service[service] || 0) + 1;
    }
  }

  const sorted = obj =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  const output = {
    allTime: {
      country: sorted(allTime.country),
      ip: sorted(allTime.ip),
      service: sorted(allTime.service)
    },
    today: {
      country: sorted(today.country),
      ip: sorted(today.ip),
      service: sorted(today.service)
    }
  };

  fs.writeFileSync(statsFile, JSON.stringify(output, null, 2));
}

setInterval(parseLogs, 10_000); // update every 10 seconds
parseLogs(); // initial

