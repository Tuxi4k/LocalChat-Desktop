const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setHost: (host) => ipcRenderer.send('setHost', host),
  sendMessage: (message) => ipcRenderer.send('sendMessage', message),
  receiveMessage: (message) => ipcRenderer.on('receiveMessage', message),
});