const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
const morgan = require('morgan');
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { json } = require('express');

const app = express();
app.use(express.json());

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
let user_dir = process.env.HOME + `\\AppData\\Local\\Google\\Chrome\\User Data`;
// const client = new Client({
//     authStrategy: new LocalAuth()
// });
try {
    fs.unlinkSync("./last.qr");
} catch (err) {}
global.client = new Client({
    // authStrategy: new LocalAuth({
    //     clientId: "client---one"
    // }),
    puppeteer: {
        userDataDir: user_dir,
        headless: false,
        // args: [
        //     '--disable-gpu',
        //     '--disable-dev-shm-usage',
        //     '--disable-setuid-sandbox',
        //     '--no-first-run',
        //     '--no-sandbox',
        //     '--no-zygote',
        //     '--use-gl=egl'
        // ],
        // ignoreDefaultArgs: ['--disable-extensions'],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
});

// const client = new Client({
//     puppeteer: { headless: false }, // Make headless true or remove to run browser in background
//     session: sessionCfg,
// });

client.initialize();

// Add this after express code but before starting the server

client.on('qr', qr => {
    // NOTE: This event will not be fired if a session is specified.
    // console.log('QR RECEIVED', qr);
    fs.writeFileSync("./last.qr", qr);
    // qrcode.generate(qr, { small: true }); // Add this line
    // app.get('/getqr', (req, res, next) => {
    //     res.send({ qr });
    // });
});
// app.get("/getqr", async(req, res) => {
//     client
//         .getState()
//         .then((data) => {
//             if (data) {
//                 res.write("<html><body><h2>Already Authenticated</h2></body></html>");
//                 res.end();
//             } else sendQr(res);
//         })
//         .catch(() => sendQr(res));
// });

// function sendQr(res) {
//     fs.readFile("components/last.qr", (err, last_qr) => {
//         if (!err && last_qr) {
//             var page = `
//                       <html>
//                           <body>
//                               <script type="module">
//                               </script>
//                               <div id="qrcode"></div>
//                               <script type="module">
//                                   import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
//                                   let container = document.getElementById("qrcode");
//                                   QrCreator.render({
//                                       text: "${last_qr}",
//                                       radius: 0.5, // 0.0 to 0.5
//                                       ecLevel: "H", // L, M, Q, H
//                                       fill: "#536DFE", // foreground color
//                                       background: null, // color or null for transparent
//                                       size: 256, // in pixels
//                                   }, container);
//                               </script>
//                           </body>
//                       </html>
//                   `;
//             res.write(page);
//             res.end();
//         }
//     });
// }
client.on('authenticated', (session) => {
    // sessionCfg = session;
    console.log('authenticated');
    try {
        fs.unlinkSync("./last.qr");
    } catch (err) {}
    // fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
    //     if (err) {
    //         console.error(err);
    //     }
    // });
});


client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on("disconnected", () => {
    console.log("disconnected");
});

// app.post('/sendmessage', async(req, res, next) => {
//     try {
//         let state = await client.getState()
//         const { number, message } = req.body; // Get the body
//         if (state != 'CONNECTED') {
//             res.send(500, { 'error': 'client not connected' });
//         } else {
//             var number_details = await client.getNumberId(number);
//             if (number_details) {
//                 const msg = await client.sendMessage(`${number}@c.us`, message); // Send the message
//                 res.send({ 'state': 'ok' }); // Send the response
//             } else {
//                 res.send(500, { 'error': 'number not valid' })
//             }

//         }
//     } catch (error) {
//         next(error);
//     }
// });

// app.get('/messages', async(req, res, next) => {
//     try {
//         let chat_activos = await client.getChats();
//         for (const n_chat of chat_activos) {
//             var n_id = n_chat.id;
//             n_chat['messages'] = await n_chat.fetchMessages();
//         }
//         res.send(JSON.stringify(chat_activos))
//     } catch (error) {
//         next(error)
//     }
// });

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