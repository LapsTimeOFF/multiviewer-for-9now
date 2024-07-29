import { BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from "..";

const createPlayer = (path: string) => {
  let win: BrowserWindow | null = null;
  const preload = join(__dirname, "../preload/index.mjs");
  const indexHtml = join(RENDERER_DIST, "index.html");

  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload
      // webSecurity: false
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
    frame: false,
    height: 1080,
    width: 1920
  });

  win.setAspectRatio(16 / 9);

  // return win.loadURL("https://shaka-player-demo.appspot.com/");

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL + `#${path}`);
  } else {
    win.loadFile(indexHtml + `#${path}`);
  }
};

export default function () {
  ipcMain.handle("player:create", async (event, path: string) => {
    return createPlayer(path);
  });
}
