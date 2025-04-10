const { ipcRenderer } = require('electron');
const { NetworkManager } = require('./network-manager');

// UI Elements
const messageDisplay = document.getElementById('message-display');
const messageEntry = document.getElementById('message-entry');
const sendBtn = document.getElementById('send-btn');
const nicknameEntry = document.getElementById('nickname-entry');
const startBtn = document.getElementById('start-btn');
const peersListbox = document.getElementById('peers-listbox');
const eduText = document.getElementById('edu-text');

// Statistics labels
const statsLabels = {
  'Status': document.getElementById('status-label'),
  'Local IP': document.getElementById('local-ip-label'),
  'UDP Port': document.getElementById('udp-port-label'),
  'TCP Port': document.getElementById('tcp-port-label'),
  'Messages Sent': document.getElementById('messages-sent-label'),
  'Messages Received': document.getElementById('messages-received-label'),
  'Peers Discovered': document.getElementById('peers-discovered-label'),
  'Session Duration': document.getElementById('session-duration-label')
};

// Network manager instance
let networkManager = null;

// Event listeners
messageEntry.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);
startBtn.addEventListener('click', startP2P);

// Initialize educational content
function initializeEducationalContent() {
  const content = `🔹 P2P Chat Application:
- Uses both TCP and UDP protocols
- UDP for peer discovery (broadcast)
- TCP for reliable messaging

🔹 TCP (Transmission Control Protocol):
- Connection-oriented protocol
- Reliable, ordered delivery
- Error checking and retransmission
- Perfect for chat applications

🔹 UDP (User Datagram Protocol):
- Connectionless protocol
- Used for peer discovery broadcasts
- Fast but less reliable than TCP

🔹 Socket Programming:
- Enables network communication
- Uses IP addresses and ports
- Allows data exchange between peers

🔹 IPv4 Addressing:
- Format: xxx.xxx.xxx.xxx
- Each number: 0-255
- Used to identify devices on network

Enter your nickname and click 'Start' to join the P2P network!`;

  eduText.textContent = content;
}

// Start P2P networking
function startP2P() {
  const nickname = nicknameEntry.value.trim();
  if (!nickname) {
    displaySystemMessage('Error: Please enter a nickname');
    return;
  }

  // Initialize network manager with nickname
  networkManager = new NetworkManager(nickname);

  // Set callbacks for UI updates
  networkManager.setCallbacks({
    onMessageReceived: displayMessage,
    onPeersUpdated: updatePeersList,
    onSystemLog: displaySystemMessage
  });

  // Start networking
  if (networkManager.startNetworking()) {
    // Disable nickname entry and start button
    nicknameEntry.disabled = true;
    startBtn.disabled = true;

    // Enable message entry and send button
    messageEntry.disabled = false;
    sendBtn.disabled = false;

    // Start statistics update
    startStatisticsUpdate();

    // Start checking for inactive peers
    startInactivePeersCheck();
  } else {
    displaySystemMessage('Error: Failed to start P2P networking');
  }
}

// Send message to selected peers
function sendMessage() {
  if (!networkManager) {
    displaySystemMessage('Please start the chat first!');
    return;
  }

  const message = messageEntry.value.trim();
  if (message) {
    // Get selected peer IPs
    const selectedOptions = Array.from(peersListbox.selectedOptions);
    const selectedPeers = selectedOptions.map(option => {
      // Extract IP from format "Nickname (IP)"
      const peerEntry = option.text;
      const ipStart = peerEntry.lastIndexOf('(') + 1;
      const ipEnd = peerEntry.lastIndexOf(')');
      if (ipStart > 0 && ipEnd > ipStart) {
        return peerEntry.substring(ipStart, ipEnd);
      }
      return null;
    }).filter(ip => ip !== null);

    // Send message to selected peers
    networkManager.sendMessageToSelectedPeers(selectedPeers, message);

    // Clear message entry
    messageEntry.value = '';
  }
}

// Update peers list in UI
function updatePeersList(peers) {
  // Clear current list
  peersListbox.innerHTML = '';

  // Add each peer
  for (const [ip, info] of Object.entries(peers)) {
    const nickname = info.nickname || 'Unknown';
    const option = document.createElement('option');
    option.text = `${nickname} (${ip})`;
    option.value = ip;
    peersListbox.add(option);
  }
}

// Display a message in the chat window
function displayMessage(timestamp, sender, senderIp, message) {
  const messageElement = document.createElement('div');
  messageElement.id = `messageElement`;
  messageElement.style.display = 'flex';
  messageElement.style.flexDirection = 'column';


  const senderElement = document.createElement('strong');
  senderElement.textContent = `${sender}\t`;

  const timeElement = document.createElement('div');
  timeElement.textContent = `${timestamp}`;
  timeElement.style.alignSelf = 'flex-end';

  const messageText = document.createTextNode(` ${message}`);

  // Append sender and message to the messageElement
  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageText);
  messageElement.appendChild(timeElement);

  if (sender === "You") {
    messageElement.style.alignSelf = 'flex-end';
  } else {
    messageElement.style.alignSelf = 'flex-start';
  }

  messageElement.style.backgroundColor = '#9CAA88'; 
  messageElement.style.color = 'black'; 
  messageElement.style.padding = '5px';
  messageElement.style.borderRadius = '5px'; 
  messageElement.style.marginBottom = '5px';
  messageElement.style.minWidth = '100px';
  messageElement.style.width = 'fit-content';

  messageDisplay.appendChild(messageElement);
  messageDisplay.scrollTop = messageDisplay.scrollHeight;
}

// Display a system message in the chat window
function displaySystemMessage(message) {
  const timestamp = new Date().toLocaleTimeString();
  const messageElement = document.createElement('div');
  messageElement.id = `messageElement`;
  messageElement.textContent = `${message}`;
  messageElement.style.backgroundColor = 'grey'; 
  messageElement.style.color = 'white'; 
  messageElement.style.padding = '5px';
  messageElement.style.borderRadius = '5px'; 
  messageElement.style.marginBottom = '5px';
  messageElement.style.width = 'fit-content'; 
  messageElement.style.alignSelf = 'center';
  messageDisplay.appendChild(messageElement);
  messageDisplay.scrollTop = messageDisplay.scrollHeight;
}

// Update statistics in the UI
function startStatisticsUpdate() {
  setInterval(() => {
    if (networkManager) {
      const stats = networkManager.getStats();

      // Update statistics labels
      statsLabels['Status'].textContent = stats.status;
      statsLabels['Local IP'].textContent = stats.localIp;
      statsLabels['UDP Port'].textContent = stats.udpPort;
      statsLabels['TCP Port'].textContent = stats.tcpPort;
      statsLabels['Messages Sent'].textContent = stats.messagesSent;
      statsLabels['Messages Received'].textContent = stats.messagesReceived;
      statsLabels['Peers Discovered'].textContent = stats.peersDiscovered;
      statsLabels['Session Duration'].textContent = stats.sessionDuration;
    }
  }, 1000);
}

// Check for inactive peers
function startInactivePeersCheck() {
  networkManager.inactivePeersInterval = setInterval(() => {
    if (networkManager) {
      networkManager.checkInactivePeers();
    }
  }, 10000); // Check every 10 seconds
}

// Handle window close
window.addEventListener('beforeunload', () => {
  if (networkManager) {
    networkManager.cleanup();
  }
});

// Initialize app
function initialize() {
  // Display welcome message
  displaySystemMessage('Welcome to P2P Chat Application!');
  displaySystemMessage('Enter your nickname and click \'Start\' to join the P2P network.');

  // Initialize educational content
  initializeEducationalContent();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
