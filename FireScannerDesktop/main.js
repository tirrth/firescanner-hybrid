const electron = require("electron");
const { app, BrowserWindow } = electron;

// Listen for app to be ready
app.on("ready", function () {
  // Create new window
  const mainWindow = new BrowserWindow({});
  // Load html in window
  mainWindow.loadURL("https://firescanner.web.app/");
  // Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });
});
