import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import qrcode from "qrcode-terminal"

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth")

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update

        // Tampilkan QR di terminal
        if (qr) {
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("Bot connected!")
        }

        if (connection === "close") {
            console.log("Connection closed, restarting...")
            startBot()
        }
    })

    sock.ev.on("creds.update", saveCreds)
}

startBot()
