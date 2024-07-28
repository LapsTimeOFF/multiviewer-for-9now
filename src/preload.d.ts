import { api } from "electron/preload";
import RxPlayer from "rx-player";

declare global {
  interface Window {
    // expose in the `electron/preload/index.ts`
    ipcRenderer: import("electron").IpcRenderer;
    mv: typeof api;
    player: RxPlayer | null | undefined;
  }
}
