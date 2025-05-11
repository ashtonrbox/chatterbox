const { app, BrowserWindow } = require('electron');
const os = require('os');
const path = require('path');
const { startServer } = require('./server.js');

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const interfaceInfo of interfaces) {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        return interfaceInfo.address;
      }
    }
  }
  return null;
}

const localIP = getLocalIP();
console.log(`Server is running at http://${localIP}:3000`);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 380,
    minHeight: 500,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.platform === "darwin") {
    win.setWindowButtonVisibility(false);
  }

  win.loadURL(`http://${localIP}:3000`);
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});
