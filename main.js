global.window = {document: {createElementNS: () => {return {}} }};
global.navigator = {};
global.btoa = () => {};
const electron = require('electron');
const {dialog} = require('electron');
const url = require('url');
const path = require('path');
const os = require('os');
var XLSX = require('xlsx');
var fs = require('fs');
var jsPDF = require('jspdf');
var fs = require('fs-extra');
var Papa = require('papaparse')
var list_size = 0;
var list_sheets = [];
const{app, BrowserWindow, Menu, ipcRenderer, ipcMain} = electron;
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

    // Build main Menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert main Menu
    Menu.setApplicationMenu(mainMenu)
    mainWindow.setSize(450,500)

});


//send data to be appended onto html list
function send_data(data){
    if(process.platform == 'darwin'){
        split_data = data[0].split('/');
        parsed_data = split_data[split_data.length-1]
    }else{
        split_data = data[0].split('\\');
        parsed_data = split_data[split_data.length-1]
    }
    list_size += 1;
    mainWindow.webContents.send('sheet:add', parsed_data);
}


// Listen for button
ipcMain.on('invoice:make', function(e, item){
    console.log(list_sheets.length);
    if (list_size != 0){
        for(k = 0; k < list_sheets.length; k++){
            if(list_sheets[k] == ''){
                continue;
            }
            var workbook = XLSX.readFile(list_sheets[k][0]);
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]);
            var results = Papa.parse(xlData);
            var data = results.data;
            createPDF(data);
        }
    }else{
        console.log("no sheet!");
        mainWindow.webContents.send('alert:sheet', 'str');
    }
    list_sheets.length = 0;
    mainWindow.webContents.send('del:all', 'str');
});

// Listen for button
ipcMain.on('del:item', function(e, item){
    list_size -= 1;
    list_sheets[item] = '';
});


// creates PDFs
function createPDF(results){
    var results_length = results.length;
    
    // variables for our pdf file
    var journalEntry = ''
    var invNum = ''
    var serviceDate = ''
    var description = ''
    var totalCharge = ''
    var fund = ''
    var costCenter = ''
    var program = ''
    var gift = ''
    var grant = ''
    var project = ''
    var function_data = ''
    var accountNum = ''
    for(j = 1; j < results.length; j++){
        curr_data = results[j];
        if (curr_data[2] != ''){
            for(i = 0; i < curr_data.length; i++){
            switch(i){
                case 0:
                    journalEntry = curr_data[i];
                break;
                case 1:
                    invNum = Number(curr_data[i]);
                break;
                case 2:
                    serviceDate = curr_data[i];
                break;
                case 3:
                    description = curr_data[i];
                break;
                case 4:
                    fund = curr_data[i];
                break;
                case 5:
                    costCenter = curr_data[i];
                break;
                case 6:
                    program = curr_data[i];
                break;
                case 7:
                    gift = curr_data[i];
                break;
                case 8:
                    grant = curr_data[i];
                break;
                case 9:
                    project = curr_data[i];
                break;
                case 10:
                    function_data = curr_data[i];
                break;
                case 11:
                    totalCharge = curr_data[i]
                break;

            }

            // construct our account number string
            accountNum = fund + costCenter + program + gift + grant + project + function_data
            var doc = new jsPDF('p', 'mm', 'a5');
            doc.setFontSize(24);
            doc.setFontType("bold");
            doc.text("BILLING MEMORANDUM", 0, 10);
            doc.setFontType("normal");
            doc.setFontSize(16);
            doc.text("Invoice #: " + invNum.toString(), 0, 20);
            doc.text("Date of invoice: " + journalEntry.toString(), 0, 30);
            doc.text("Description: " + description.toString(), 0, 40);
            doc.text("Account Number: " + accountNum.toString(), 0, 50);
            doc.text("Total Amount Due: " + totalCharge.toString(), 0, 60);
            doc.text("Date of Usage: " + serviceDate.toString(), 0, 70);
            doc.setFontStyle("bold");
            doc.setFontSize(12);
            doc.text("Note: SageCoach trips are billed according to the following:", 0, 100);
            doc.text("1. 47 Things Trip - $1.50 per mile", 0, 105);
            doc.text("2. General Student Trip-$1.50 per mile + $20 per hour", 0, 110);
            doc.text("3. Non-student related trips", 0, 115);
            doc.text("1. Around Claremont-$40 per hour", 5, 120);
            doc.text("2. Outside of Claremont-$30 per hour + $1.50 per mile", 5, 125);
            doc.text("If there are any questions, please feel free to contact Brenda Schmit", 0, 130);
            doc.text("by phone at campus ext. 18984 or by email at bls04747@pomona.edu", 0, 135);
            doc.text("NOTE: If you received this invoice for a trip that you requested", 0, 155);
            doc.text("or participated in, but you are not responsible for billing,", 0, 160);
            doc.text("please forward this not the appropriate entity.", 0, 165)
            doc.text("Thank you,", 0, 175);
            doc.text("Eberto Andre Ruiz,", 0, 180);
            doc.text("Student Vehicle Billing Manager", 0, 185)
            var data = doc.output();
        }

        var file_path = path.join(os.homedir(),'Desktop','SageCoach_Invoices',"InvoiceNum"+invNum.toString()+'.pdf')

        console.log("Just made invoice: " + invNum.toString())
        fs.outputFile(file_path, data, function (err) {
            // console.log(err); // null if no err
        });
        
        
        delete global.window;
        delete global.navigator;
        delete global.btoa;
        }
    }
}

// Create template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add sheet',
                click(){

                var data = dialog.showOpenDialog({ properties: ['openFile'] });
                if(data != null){
                    list_sheets.push(data)
                    send_data(data);
                    }
                },

            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Crtl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}


if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
      label: 'Developer Tools',
      submenu:[
        {
          role: 'reload'
        },
        {
          label: 'Toggle DevTools',
          accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
          click(item, focusedWindow){
            focusedWindow.toggleDevTools();
          }
        }
      ]
    });
}
