const electron = require('electron');
const path = require('path');

// Access the app and BrowserWindow modules through the electron module
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;

// Wait until the app is ready
app.on('ready', function() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  
  // Open DevTools in development mode (uncomment to use)
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', function() {
    // Dereference the window object
    mainWindow = null;
  });
});

// Quit when all windows are closed
app.on('window-all-closed', function() {
  // On macOS it is common for applications to stay open until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    // Create a new window when the app is activated and no window exists
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  }
});

// IPC communication for network operations
ipcMain.on('configure-firewall', (event, ports) => {
  const { configureFirewall } = require('./src/network-manager');
  const result = configureFirewall(ports.udpPort, ports.tcpPort);
  event.reply('firewall-configured', result);
});
