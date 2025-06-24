# Attack Map

A live, real-time visualisation of cyber attack traffic, showing source and destination locations across the globe. This project is ideal for showcasing honeypot data, WebSocket-based intrusion attempts, or as a dramatic centrepiece on a security operations centre display.

## ?? Features

- Real-time WebSocket-based attack visualisation
- World map with animated arcs between source and destination
- Popup notifications per attack
- Modular logging system (`log.txt`) to track and analyse data
- Easily extensible backend to support various services (SSH, FTP, Apache, etc.)

## ??? Installation

1. Clone this repository:

   ```bash
   git clone git@github.com:leonteale/attack-map.git
   cd attack-map
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional but recommended) Ignore `node_modules` in version control:

   ```bash
   echo "node_modules/" >> .gitignore
   ```

## ?? Usage

Run the server in the background:

```bash
sudo node main.js &
```

Or run it normally for debugging:

```bash
sudo node main.js
```

This will start the backend which listens for incoming WebSocket messages and updates the front-end visualisation in real time.

## ?? Directory Structure

```
attackmap/
+-- main.js             # Main Node.js backend server
+-- log.txt             # Attack log file (auto-generated)
+-- public/             # Static front-end assets (map, CSS, client JS)
+-- routes/             # Backend WebSocket handlers
+-- .gitignore          # Git exclusions
+-- package.json        # Project metadata and dependencies
```

## ?? Notes

- Attack data should be sent to the WebSocket endpoint in the expected format (IP, service, etc.).
- You can build your own logging modules, or feed it from external honeypot logs or fail2ban triggers.

## ?? Example Use Cases

- Visualise brute force attacks from SSH, FTP, or web applications
- Use in cyber security presentations or awareness demos
- Show off on a large screen in your office!

## ?? Security Tip

If deployed publicly, ensure `.htaccess` and `.htpasswd` are used to protect sensitive routes, but **do not commit them to the repo**.
