const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
// const morgan = require('morgan');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();
// const qrcode = require('qrcode-terminal');
// const { json } = require('express');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let clientId = 'main_clint'
try {
    fs.unlinkSync("./last.qr");
} catch (err) {}



connectWpp()

function connectWpp(forceNewSession = false) {

    global.client = new Client({
        authStrategy: new LocalAuth({
            clientId: clientId
        }),
        puppeteer: {
            headless: true,
            args: [
                '--disable-dev-shm-usage',
                '--no-sandbox'
            ]
        }
    });

    client.initialize();
    console.log('initialize');

    client.on('qr', qr => {
        fs.writeFileSync("./last.qr", qr);
        console.log('save qr');
    });

    client.on('authenticated', (session) => {
        console.log('authenticated');
        try {
            fs.unlinkSync("./last.qr");
        } catch (err) {}
    });
    client.on('change_state', state => {
        console.log(state);
    })

    client.on('auth_failure', msg => {
        // Fired if session restore was unsuccessfull
        console.error('AUTHENTICATION FAILURE', msg);
    });

    client.on('ready', () => {
        console.log('READY');
        // console.log(client.info);
    });
    client.on("disconnected", () => {
        console.log("disconnected");
        try {
            client.destroy()
            setTimeout(() => {
                connectWpp()
            }, 3000)

        } catch (error) {
            console.error('Error on session finished. %s', error);
        }
    });

}


const chatRoute = require("./components/chatting");
const groupRoute = require("./components/group");
const authRoute = require("./components/auth");
const contactRoute = require("./components/contact");

app.use(function(req, res, next) {
    console.log(req.method + " : " + req.path);
    next();
});


app.use("/chat", chatRoute);
app.use("/group", groupRoute);
app.use("/auth", authRoute);
app.use("/contact", contactRoute);

// Listening for the server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running Live on Port : http://localhost:${PORT}`));


// npm run dev