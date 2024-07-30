import { BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "path";
import { VITE_DEV_SERVER_URL } from "..";
import { fileURLToPath } from "node:url";
import { contextMenu } from "./contextMenu";

const __dirname = dirname(fileURLToPath(import.meta.url));

const createPlayer = (path: string, port: string, slugs: string[]) => {
  let win: BrowserWindow | null = null;
  const preload = join(__dirname, "../preload/index.mjs");

  // Calculate the number of rows and columns
  const numRows = Math.floor(Math.sqrt(slugs.length));
  const numCols = Math.ceil(slugs.length / numRows);

  // Calculate the dimensions of each player window to maintain a 16:9 aspect ratio
  const playerWidth = 1920 / numCols;
  const playerHeight = playerWidth * (9 / 16);

  // Calculate the main window dimensions
  const mainWindowWidth = playerWidth * numCols;
  const mainWindowHeight = playerHeight * numRows;

  win = new BrowserWindow({
    title: "Grid - MV 9NOW",
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
    height: mainWindowHeight,
    width: mainWindowWidth,
    autoHideMenuBar: true,
    titleBarStyle: "customButtonsOnHover"
  });

  win.setAspectRatio((numCols * 16) / (numRows * 9));

  // return win.loadURL("https://shaka-player-demo.appspot.com/");

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL + `#${path}`);
  } else {
    win.loadURL(`http://localhost:${port}/#${path}`);
  }

  win.webContents.on("context-menu", () => {
    contextMenu.popup({ window: win });
  });
};

export default function () {
  ipcMain.handle(
    "player:create",
    async (_, path: string, port: string, slugs: string[]) => {
      return createPlayer(path, port, slugs);
    }
  );
}
