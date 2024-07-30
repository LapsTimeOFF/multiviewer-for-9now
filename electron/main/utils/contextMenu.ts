import { BrowserWindow, Menu, screen } from "electron";

const contextTemplate: Array<
  Electron.MenuItemConstructorOptions | Electron.MenuItem
> = [
  {
    label: "Close player",
    click: (_, win) => {
      win?.close();
    }
  },
  {
    label: "Close all grids",
    click: () => {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (win.webContents.getURL().includes("/grid")) {
          win.close();
        }
      });
    }
  },
  {
    label: "Close other grids",
    click: (_, win) => {
      BrowserWindow.getAllWindows().forEach((window) => {
        if (
          window.webContents.getURL().includes("/grid") &&
          window.id !== win?.id
        ) {
          window.close();
        }
      });
    }
  },
  {
    label: "Full screen",
    click: (_, win) => {
      win?.setFullScreen(!win.isFullScreen());
    }
  },
  {
    label: "Always on top",
    click: (_, win) => {
      win?.setAlwaysOnTop(!win.isAlwaysOnTop());
    }
  },
  {
    type: "separator"
  },
  {
    label: "Set size",
    submenu: [
      {
        label: "Whole screen",
        click: (_, win) => {
          if (!win) return;
          const display = screen.getPrimaryDisplay();
          const { width, height } = display.workAreaSize;

          win.setBounds({
            x: 0,
            y: 0,
            width,
            height
          });
        }
      },
      {
        label: "Half screen",
        click: (_, win) => {
          if (!win) return;
          const winBounds = win.getBounds();

          const displays = screen.getAllDisplays();

          const display = displays.find((d) => {
            return (
              winBounds.x >= d.bounds.x &&
              winBounds.x < d.bounds.x + d.bounds.width &&
              winBounds.y >= d.bounds.y &&
              winBounds.y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: display.bounds.width / 2,
            height: ((display.bounds.width / 2) * 9) / 16
          });
        }
      },
      {
        label: "1/3rd screen",
        click: (_, win) => {
          if (!win) return;
          const winBounds = win.getBounds();

          const displays = screen.getAllDisplays();

          const display = displays.find((d) => {
            return (
              winBounds.x >= d.bounds.x &&
              winBounds.x < d.bounds.x + d.bounds.width &&
              winBounds.y >= d.bounds.y &&
              winBounds.y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: display.bounds.width / 3,
            height: ((display.bounds.width / 3) * 9) / 16
          });
        }
      },
      {
        label: "1/4th screen",
        click: (_, win) => {
          if (!win) return;
          const winBounds = win.getBounds();

          const displays = screen.getAllDisplays();

          const display = displays.find((d) => {
            return (
              winBounds.x >= d.bounds.x &&
              winBounds.x < d.bounds.x + d.bounds.width &&
              winBounds.y >= d.bounds.y &&
              winBounds.y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: display.bounds.width / 4,
            height: ((display.bounds.width / 4) * 9) / 16
          });
        }
      },
      {
        type: "separator"
      },
      {
        label: "1080p",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: 1920,
            height: 1080
          });
        }
      },
      {
        label: "720p",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: 1280,
            height: 720
          });
        }
      },
      {
        label: "480p",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: 854,
            height: 480
          });
        }
      },
      {
        label: "360p",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: 640,
            height: 360
          });
        }
      },
      {
        label: "270p",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: 480,
            height: 270
          });
        }
      }
    ]
  },
  {
    label: "Position",
    submenu: [
      {
        label: "Top left",
        click: (_, win) => {
          if (!win) return;
          win.setBounds({
            x: 0,
            y: 0,
            width: win.getBounds().width,
            height: win.getBounds().height
          });
        }
      },
      {
        label: "Top right",
        click: (_, win) => {
          if (!win) return;
          const displays = screen.getAllDisplays();
          const display = displays.find((d) => {
            return (
              win.getBounds().x >= d.bounds.x &&
              win.getBounds().x < d.bounds.x + d.bounds.width &&
              win.getBounds().y >= d.bounds.y &&
              win.getBounds().y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: display.bounds.width - win.getBounds().width,
            y: 0,
            width: win.getBounds().width,
            height: win.getBounds().height
          });
        }
      },
      {
        label: "Bottom left",
        click: (_, win) => {
          if (!win) return;
          const displays = screen.getAllDisplays();
          const display = displays.find((d) => {
            return (
              win.getBounds().x >= d.bounds.x &&
              win.getBounds().x < d.bounds.x + d.bounds.width &&
              win.getBounds().y >= d.bounds.y &&
              win.getBounds().y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: 0,
            y: display.bounds.height - win.getBounds().height,
            width: win.getBounds().width,
            height: win.getBounds().height
          });
        }
      },
      {
        label: "Bottom right",
        click: (_, win) => {
          if (!win) return;
          const displays = screen.getAllDisplays();
          const display = displays.find((d) => {
            return (
              win.getBounds().x >= d.bounds.x &&
              win.getBounds().x < d.bounds.x + d.bounds.width &&
              win.getBounds().y >= d.bounds.y &&
              win.getBounds().y < d.bounds.y + d.bounds.height
            );
          });

          if (!display) return;

          win.setBounds({
            x: display.bounds.width - win.getBounds().width,
            y: display.bounds.height - win.getBounds().height,
            width: win.getBounds().width,
            height: win.getBounds().height
          });
        }
      }
    ]
  }
];

export const contextMenu = Menu.buildFromTemplate(contextTemplate);
