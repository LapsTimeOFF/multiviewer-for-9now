import { ipcMain } from "electron";
import Store, { Schema } from "electron-store";

const schema: Schema<Record<string, unknown>> = {
  token: {
    type: "string"
  }
};

const store = new Store({
  schema
});

const set = (key: string, value: unknown) => {
  store.set(key, value);
  console.log(key, value);
};

const get = (key?: string) => {
  console.log("get", key);
  if (!key || key === "") return store.store;
  return store.get(key);
};

const remove = (key: string) => {
  store.delete(key);
  console.log("delete", key);
};

export default function () {
  ipcMain.handle("config:set", async (event, key: string, value: unknown) => {
    set(key, value);
  });

  ipcMain.handle("config:get", async (event, key?: string) => {
    return get(key);
  });

  ipcMain.handle("config:remove", async (event, key: string) => {
    remove(key);
  });
}
