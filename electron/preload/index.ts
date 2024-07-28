import { ipcRenderer, contextBridge } from "electron";
import { Catalogs } from "shared/catalogTypes";
import { ConfigSchema, OutData } from "shared/types";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  }
});

export const api = {
  mycanal: {
    initLiveTV: (tokenPass: string): Promise<OutData> =>
      ipcRenderer.invoke("mycanal:initLiveTV", tokenPass),
    getCatalog: (url?: string): Promise<Catalogs> =>
      ipcRenderer.invoke("mycanal:getCatalog", url)
  },
  config: {
    set: (key: keyof ConfigSchema, value: unknown) => {
      ipcRenderer.invoke("config:set", key, value);
    },
    get: (key?: keyof ConfigSchema) => ipcRenderer.invoke("config:get", key),
    remove: (key: string) => {
      ipcRenderer.invoke("config:remove", key);
    }
  }
};

contextBridge.exposeInMainWorld("mv", api);
