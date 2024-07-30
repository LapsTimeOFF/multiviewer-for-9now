import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  session
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import handler from "serve-handler";
import getPort from "get-port";

import nineNow from "./utils/9now";
import config from "./utils/config";
import player from "./utils/player";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

export const privileges: Electron.Privileges = {
  standard: true,
  bypassCSP: true,
  allowServiceWorkers: true,
  supportFetchAPI: true,
  corsEnabled: false,
  stream: true
};

protocol.registerSchemesAsPrivileged([
  { scheme: "http", privileges },
  { scheme: "https", privileges },
  { scheme: "wss", privileges },
  { scheme: "mailto", privileges: { standard: true } }
]);

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

const ipc = [nineNow, config, player];

for (const api of ipc) {
  api();
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload
      // webSecurity: false
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
    autoHideMenuBar: true
  });

  // return win.loadURL("https://shaka-player-demo.appspot.com/");

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    const server = http.createServer((req, res) => {
      return handler(req, res, {
        public: RENDERER_DIST
      });
    });

    const port = await getPort();

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    win.loadURL(`http://localhost:${port}`);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

export const userAgent =
  process.platform === "darwin"
    ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36"
    : process.platform === "linux"
      ? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36";

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: [
        "https://9now.com.au/*",
        "https://*.9now.com.au/*",
        "https://akamaized.net/*",
        "https://*.akamaized.net/*",
        "https://brightcove.com/*",
        "https://*.brightcove.com/*",
        "https://yospace.com/*",
        "https://*.yospace.com/*"
      ]
    },
    (details, callback) => {
      const { ...headers } = details.requestHeaders;

      callback({
        requestHeaders: {
          ...headers,
          referer: "https://www.9now.com.au/",
          Origin: "https://www.9now.com.au",
          "Sec-Fetch-Site": "same-site",
          "User-Agent": userAgent,
          Dnt: "1"
          // Cookie: [authCookie, Cookie, cookie]
          //     .filter(Boolean)
          //     .join('; '),
        }
      });
    }
  );

  createWindow();
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
