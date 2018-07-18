const electron = require('electron');
const url = require('url');
const path = require('path');

const{app, BrowserWindow, Menu} = electron;

let mainWindow;
// Listen for app to be ready 
app.on('ready', function(){

    // Create new window
    mainWindow = new BrowserWindow({});

    // Load HTML into window 
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }))

    // Build Menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu)
});

// Create template

