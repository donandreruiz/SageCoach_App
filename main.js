// import { prependListener } from 'cluster';

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


function createPDF(results){
    var results_length = results.length;
    test_data = results[1]
    
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
    var i = 0;
    for(i = 0; i < test_data.length; i++){
        switch(i){
            case 0:
                journalEntry = test_data[i];
            break;
            case 1:
                invNum = Number(test_data[i]);
            break;
            case 2:
                serviceDate = test_data[i];
            break;
            case 3:
                description = test_data[i];
            break;
            case 4:
                fund = test_data[i];
            break;
            case 5:
                costCenter = test_data[i];
            break;
            case 6:
                program = test_data[i];
            break;
            case 7:
                gift = test_data[i];
            break;
            case 8:
                grant = test_data[i];
            break;
            case 9:
                project = test_data[i];
            break;
            case 10:
                function_data = test_data[i];
            break;
            case 11:
                totalCharge = test_data[i]
            break;

        }

        // construct our account number string
        accountNum = fund + costCenter + program + gift + grant + project + function_data
        var doc = new jsPDF();
        doc.setFontSize(24);
        doc.setFontType("bold");
        doc.text("BILLING MEMORANDUM", 0, 10);
        doc.setFontType("normal");
        doc.setFontSize(16);
        doc.text("Invoice #: " + invNum.toString(), 0, 20);
        doc.text("Date of invoice " + journalEntry.toString(), 0, 30);
        doc.text("Description: " + description.toString(), 0, 40);
        doc.text("Account Number : " + accountNum.toString(), 0, 50);
        doc.text("Total Amount Due : " + totalCharge.toString(), 0, 60);
        doc.text("Date of Usage : " + serviceDate.toString(), 0, 70);
        doc.setFontStyle("bold");
        doc.setFontSize(14);
        doc.text("Note: SageCoach trips are billed according to the following:", 0, 100);
        doc.text("1. 47 Things Trip - $1.50 per mile", 0, 105);
        doc.text("2. General Student Trip-$1.50 per mile + $20 per hour", 0, 110);
        doc.text("3. Non-student related trips", 0, 115);
        doc.text("1. Around Claremont-$40 per hour", 5, 120);
        doc.text("2. Outside of Claremont-$30 per hour + $1.50 per mile", 5, 125);
        doc.text("If there are any questions, please feel free to contact Brenda Schmit by phone at", 0, 130);




        var data = doc.output();




        // pdf.cell(0, 10, 'Note: SageCoach trips are billed according to the following:', 0, 1, 'L')
        // pdf.set_font('Arial', '', 14)
        // pdf.cell(0, 5, '1. "47 Things" Trip-$1.50 per mile', 0, 1, 'L')
        // pdf.cell(0, 5, '2. General Student Trip-$1.50 per mile + $20 per hour', 0, 1, 'L')
        // pdf.cell(0, 5, '3. Non-student related trips', 0, 1, 'L')
        // pdf.set_x(30)
        // pdf.cell(0, 5, '1. Around Claremont-$40 per hour', 0, 1, 'L')
        // pdf.set_x(30)
        // pdf.cell(0, 5, '2. Outside of Claremont-$30 per hour + $1.50 per mile', 0, 1, 'L')
        // pdf.cell(0, 10, ' ', 0, 1, 'L')
        // pdf.cell(0, 5, 'If there are any questions, please feel free to contact Brenda Schmit by phone at', 0, 1,
        //          'L')
        // pdf.cell(0, 5, 'campus ext. 18984 or by email at bls04747@pomona.edu', 0, 1, 'L')
        // pdf.cell(0, 10, ' ', 0, 1, 'L')
        // pdf.cell(0, 5, 'NOTE: If you received this invoice for a trip that you requested or participated in, but',
        //          0, 1, 'L')
        // pdf.cell(0, 5, 'you are not responsible for billing, please forward this not the appropriate entity.', 0, 1,
        //          'L')
        // pdf.cell(0, 10, ' ', 0, 1, 'L')
        // pdf.cell(0, 5, 'Thank you,', 0, 1, 'L')
        // pdf.cell(0, 5, 'Eberto Andre Ruiz', 0, 1, 'L')
        // pdf.cell(0, 5, 'Student Vehicle Billing Manager', 0, 1, 'L')
    }

    var file_path = path.join(os.homedir(),'Desktop','SageCoach_Invoices','test.pdf')

    fs.outputFile(file_path, data, function (err) {
        console.log(err); // => null
    });
    
    
    delete global.window;
    delete global.navigator;
    delete global.btoa;
}

// Create template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add file',
                click(){
                /* show a file-open dialog and read the first selected file */
                var data = dialog.showOpenDialog({ properties: ['openFile'] });
                // var workbook = XLSX.readFile(o[0]);
                var workbook = XLSX.readFile(data[0]);
                var sheet_name_list = workbook.SheetNames;
                var xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]);
                var results = Papa.parse(xlData);
                var data = results.data
                createPDF(data)
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
