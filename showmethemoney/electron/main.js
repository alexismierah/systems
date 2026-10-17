
async function startElectron() {
  const { app, BrowserWindow } = await import("electron");

  function createWindow() {
    const window = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      title: "ShowMeTheMoney",
      backgroundColor: "#f8fafc",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    window.loadURL("http://localhost:3000");
  }

  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

startElectron();
