const router = require("express").Router();
const { log } = require("console");
const fs = require("fs");
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
router.get("/screen", async(req, res) => {
    let path = "public/images/screenshot.png";
    let src = "/images/screenshot.png";
    try {
        if (client.pupPage) {
            await client.pupPage.screenshot({ // Screenshot the website using defined options
                path: path, // Save the screenshot in current directory
                fullPage: true // take a fullpage screenshot
            });
            if (fs.existsSync(path)) {
                fs.readFile(path, (err, last_qr) => {
                    if (!err && last_qr) {
                        var page = `
                                <html>
                                    <body>
                                        <img src="${src}"></img>
                                    </body>
                                </html>
                            `;
                        res.write(page);
                        res.end();
                    }
                });
            } else {
                res.status(404).send({ 'error': 'img not found' })

            }


        } else {
            res.status(404).send({ 'error': 'client not found' })
        }
    } catch (error) {
        res.send({ 'error': error })
    }
})

router.get("/checkauth", async(req, res) => {
    client
        .getState()
        .then((data) => {
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            if (err) {
                res.send("DISCONNECTED");
            }
        });
});

router.get("/getqr", (req, res) => {
    client
        .getState()
        .then((data) => {
            if (data) {
                res.write("<html><body><h2>Already Authenticated</h2></body></html>");
                res.end();
            } else sendQr(res);
        })
        .catch(() => sendQr(res));
});

function sendQr(res) {
    let path = "last.qr"
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, (err, last_qr) => {
                if (!err && last_qr) {
                    var page = `
                        <html>
                            <body>
                                <script type="module">
                                </script>
                                <div id="qrcode"></div>
                                <script type="module">
                                    import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
                                    let container = document.getElementById("qrcode");
                                    QrCreator.render({
                                        text: "${last_qr}",
                                        radius: 0.5, // 0.0 to 0.5
                                        ecLevel: "H", // L, M, Q, H
                                        fill: "#536DFE", // foreground color
                                        background: null, // color or null for transparent
                                        size: 256, // in pixels
                                    }, container);
                                </script>
                            </body>
                        </html>
                    `;
                    res.write(page);
                    res.end();
                }
            });
        } else {
            res.status(404).send({ 'error': 'Qr not found' })

        }


    } catch (error) {
        console.log(error);
        res.write(error)
        res.end()
    }
}

module.exports = router;