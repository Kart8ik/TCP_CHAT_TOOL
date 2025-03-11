import { app, BrowserWindow,ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.loadFile('index.html');
});

ipcMain.on('connect', (event, { host, port }) => {
    console.log(`Connecting to ${host}:${port}`);
    // You can call server functions here if needed
});

ipcMain.on('message', (event, message) => {
    console.log(`Message received: ${message}`);
});