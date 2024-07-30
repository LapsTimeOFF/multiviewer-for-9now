import { ipcRenderer, contextBridge } from "electron";
import { GetLiveExperience } from "shared/getLiveExperienceTypes";
import { ConfigSchema } from "shared/configType";

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
  "9now": {
    getLiveExperience: (token: string): Promise<GetLiveExperience> =>
      ipcRenderer.invoke("9now:getLiveExperience", token),
    openWebsite: () => ipcRenderer.invoke("9now:openWebsite")
  },
  player: {
    create: (path: string, port: string, numberOfSlugs: string) =>
      ipcRenderer.invoke("player:create", path, port, numberOfSlugs)
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
