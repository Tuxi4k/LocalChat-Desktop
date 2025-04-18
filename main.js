const { app, BrowserWindow, ipcMain } = require('electron');
const { Menu } = require('electron')
const NodeRSA = require('node-rsa')
const crypto = require('crypto')
const path = require('path');
let aes = {}
let mainWindow;

Menu.setApplicationMenu(null)

function encrypt(data,key,iv) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText,key,iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('index.html')
  ipcMain.on('setHost', (event, host) => {
        const { io } = require("socket.io-client")
        try {socket.disconnect()}
        catch{}
        const key = new NodeRSA({b: 2048})
        const publicKey = key.exportKey('public')
        global.socket = io(`ws://${host}`, {
        reconnectionDelayMax: 10000,
        auth: {
            token: "123"
        },
        query: {
            "publicKey": publicKey
        }
        });
        setSocketevents(mainWindow,key)
        });
        ipcMain.on('sendMessage', (event, message) => {
            const encmessage = encrypt(message, Buffer.from(aes.aeskey.data),Buffer.from(aes.aesiv.data))
            socket.emit("send_message", encmessage)
            const data = {
                "id":"Me",
                "data":message
            }
            mainWindow.webContents.send('receiveMessage', data);
                });
});
function setSocketevents(mainWindow,key) {
    socket.on("keyHandshake", (message) => {
        const decrypted = JSON.parse(key.decrypt(message.data, 'utf8'))
        aes['aesiv'] = decrypted.aesiv
        aes['aeskey'] = decrypted.aeskey
    });
    socket.on("receive_message", (message) => {
        const decMessage = JSON.parse(decrypt(message,Buffer.from(aes.aeskey.data),Buffer.from(aes.aesiv.data)))
        mainWindow.webContents.send('receiveMessage', decMessage);
      });
}