'use strict';

import { app, protocol, BrowserWindow, Menu } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import Store from 'electron-store';
import * as Sentry from '@sentry/electron/dist/main';
import { version } from '../package.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment) {
  Sentry.init({
    dsn: 'https://ee4a69ddc0494b24a0dd4fdcbc905526@sentry.io/1442979',
    release: `fat-wallet@${version}`
  });
}

const appStore = new Store({ name: 'user-config.v1' });
appStore.set('latestVersionOpened', app.getVersion());

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', secure: true }]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    icon: path.join(__static, '/icon.png'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  });
  win.maximize();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

function setApplicationMenu() {
  const template = [];
  if (process.platform === 'darwin') {
    const appName = 'FAT Wallet';
    template.push({
      label: appName,
      submenu: [
        { label: `About ${appName}`, role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { label: `Hide ${appName}`, role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }
      ]
    });
  } else {
    template.push({
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    });
  }

  template.push(
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'toggleFullScreen' }
      ]
    },
    { role: 'windowMenu' }
  );

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
  if (!isDevelopment) {
    setApplicationMenu();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
