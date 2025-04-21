var express = require('express');
const QRCode = require('qrcode');
const os = require('os');
var http = require('http');
var socketIO = require('socket.io');
var path = require('path');
var fs = require('fs');
const axios = require('axios');
const cors = require('cors');

var app = express();
var server = http.Server(app);
const io = socketIO(server, {
    cors: {
        //TO DO
        //maybe have a limit on who is and who is not allowed?
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }
});

var GAMES = ['Woerdgoem', 'Cookaloor', 'Tetrys', '31seconds'];
var QRCODEDATA;
var URL;
var LOCALIP;
var PUBLICIP;
var PORT;
var gameServer;

//
// THE SETUP
//
setupVoedgoem();

async function setupVoedgoem() {
    LOCALIP = getLocalIPAddress();
    //PORT = convertLocalIpToPORT(LOCALIP);
    PORT = 2222;
    PUBLICIP = await getPublicIPAddress();
    if (!PUBLICIP) {
        console.error('Could not retrieve public IP address.');
        return;
    }
    URL = `http://${PUBLICIP}:${PORT}`;
    QRCODEDATA = await QRCode.toDataURL(URL);
    if (!QRCODEDATA) {
        console.error('Could not make a QR Code.');
        return;
    }
    bootVoedgoemServer(LOCALIP, PUBLICIP, PORT, QRCODEDATA, GAMES);
}

function bootVoedgoemServer(LOCALIP, PUBLICIP, PORT, QRCODEDATA, GAMES){
    const ServerController = require('./server.js');
    gameServer = new ServerController();
    gameServer.run(server, io);
    
    app.set('port', PORT);
    app.use('/static', express.static(__dirname + '/static'));

    app.use(cors({
        origin: 'http://localhost:3333',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }));

    for (let game of GAMES) {
        app.get('/'+game, (request, response) => response.sendFile(path.join(__dirname, './public/static/'+game+'/'+game+'.html')));
    }
    
    app.get('/qrcode', (request, response) => {
        if (!QRCODEDATA) {
            return response.status(500).json({ error: 'QR code not generated yet.' });
        }
        response.json({ src: QRCODEDATA });
    });
    app.get('/', function(request, response) {
        response.sendFile(path.join(__dirname, 'index.html'));
    });

    server.listen(PORT, async function() {
        console.log('Starting server: ' + PUBLICIP +':'+ PORT);
    });
}

app.post('/user-logged-in', express.json(), (req, res) => {
    var { id, name, socketId } = req.body;

    console.log('User logged in:', name , id);

    var userSocket = io.sockets.sockets.get(socketId);

    gameServer.doOnSuccessfulLogin(userSocket, userId, userName);

    res.status(200).json({ status: 'success' });
});


//
// FUNCTIONS
//

async function getPublicIPAddress() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error('could not get public ip address');
        return "127.0.0.1";
    }
}

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let name of Object.keys(interfaces)) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function convertLocalIpToPORT(ip) {
    const segments = ip.split('.');
	var lastsegment = segments[segments.length - 1];
	var portnumber = parseInt(lastsegment) + 3000;
    return portnumber;
}

function getFolderNamesInFolder(relativePath){
	var result= fs.readdirSync(relativePath).filter(function(file) { 
											return fs.statSync(path.join(relativePath, file)).isDirectory(); 
										});			
		return result;
}

// export
module.exports = { GAMES };