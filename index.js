const { app, BrowserWindow, shell } = require('electron');
const { Menu, ipcMain } = require('electron/main');

const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

process.env.NODE_ENV = 'production';
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';
let mainWindow;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width:  isDev? 800 : 600,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  if(isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width:  300,
    height: 300
  });

  aboutWindow.loadFile(path.join(__dirname, 'about.html'));
}

const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : []),
  {
  role: 'fileMenu'
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : []),
]

mainMenu = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(mainMenu);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('image:resize', (event, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
});

async function resizeImage({imgPath, width, height, dest}) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height
    });

    const fileName = path.basename(imgPath);
    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest)
    }

    fs.writeFileSync(path.join(dest, fileName),newPath);
    mainWindow.webContents.send('image:done');
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}
