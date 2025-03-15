const dgram = require('dgram');
const os = require('os');

// UDP Discovery configuration
const UDP_PORT = 41234;
const BROADCAST_INTERVAL = 5000; // 5 seconds
const DISCOVERY_MESSAGE = 'CHAT_APP_DISCOVERY';

// Keep track of discovered peers
let peers = new Map(); // Maps IP addresses to peer info
let udpSocket = null;
let localIp = '';
let localPort = 41235; // Default TCP port
let currentUsername = '';
let discoveryCallback = null;

// Get the local IP address (first non-internal IPv4 address)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to localhost
}

// Initialize UDP discovery service
function initDiscovery(onPeerDiscovered, username) {
  localIp = getLocalIpAddress();
  currentUsername = username;
  discoveryCallback = onPeerDiscovered;
  
  udpSocket = dgram.createSocket('udp4');

  // Handle errors
  udpSocket.on('error', (err) => {
    console.error(`UDP Error: ${err}`);
    udpSocket.close();
  });

  // Configure socket for broadcasting
  udpSocket.bind(UDP_PORT, () => {
    udpSocket.setBroadcast(true);
    console.log(`UDP discovery service running on port ${UDP_PORT}`);
    
    // Start broadcasting presence
    startBroadcasting();
  });

  // Listen for discovery messages
  udpSocket.on('message', (msg, rinfo) => {
    const message = msg.toString();
    
    // Parse discovery message: CHAT_APP_DISCOVERY|TCP_PORT|USERNAME
    if (message.startsWith(DISCOVERY_MESSAGE) && rinfo.address !== localIp) {
      const parts = message.split('|');
      if (parts.length >= 2) {
        const remoteTcpPort = parseInt(parts[1]);
        const remoteUsername = parts[2] || `User@${rinfo.address}`;
        
        // Add or update peer
        if (!peers.has(rinfo.address) || 
            peers.get(rinfo.address).port !== remoteTcpPort || 
            peers.get(rinfo.address).username !== remoteUsername) {
          
          peers.set(rinfo.address, { 
            ip: rinfo.address,
            port: remoteTcpPort, 
            username: remoteUsername 
          });
          
          console.log(`Discovered peer: ${remoteUsername} at ${rinfo.address}:${remoteTcpPort}`);
          
          // Notify callback with updated peers list
          if (discoveryCallback) {
            discoveryCallback(Array.from(peers.values()));
          }
        }
      }
    }
  });

  // Return API for the discovery service
  return {
    getPeers: () => Array.from(peers.values()),
    updateUsername: (newUsername) => {
      currentUsername = newUsername;
    },
    close: () => {
      if (udpSocket) {
        udpSocket.close();
        udpSocket = null;
      }
    }
  };
}

// Broadcast presence periodically
function startBroadcasting() {
  // Broadcast immediately
  broadcastPresence();
  
  // Then set interval
  setInterval(broadcastPresence, BROADCAST_INTERVAL);
}

// Send a broadcast message announcing presence
function broadcastPresence() {
  if (!udpSocket) return;
  
  const message = Buffer.from(`${DISCOVERY_MESSAGE}|${localPort}|${currentUsername}`);
  udpSocket.send(message, 0, message.length, UDP_PORT, '255.255.255.255', (err) => {
    if (err) {
      console.error('Error broadcasting presence:', err);
    }
  });
}

module.exports = {
  initDiscovery
};