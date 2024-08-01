import { api } from "electron/preload";
import shaka from "shaka-player/dist/shaka-player.ui";

declare global {
  interface Window {
    // expose in the `electron/preload/index.ts`
    ipcRenderer: import("electron").IpcRenderer;
    mv: typeof api;
    player: Map<string, shaka.Player> | null | undefined;
  }
}
