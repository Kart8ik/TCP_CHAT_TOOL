const { contextBridge, ipcRenderer } = require('electron');

<<<<<<< HEAD
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    sendMessage: (message, recipients) => {
      return ipcRenderer.invoke('send-message', message, recipients);
    },
    getPeers: () => {
      return ipcRenderer.invoke('get-peers');
    },
    setUsername: (username) => {
      return ipcRenderer.invoke('set-username', username);
    },
    onUpdatePeers: (callback) => {
      ipcRenderer.on('update-peers', (event, peers) => callback(peers));
    },
    onNewMessage: (callback) => {
      ipcRenderer.on('new-message', (event, message) => callback(message));
    }
  }
);
=======
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
});
>>>>>>> 85ffe1f4e8fd2f6dbd54e12d4ff79e93cd3d5fea
