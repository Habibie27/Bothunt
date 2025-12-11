const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const fs = require("fs")
const figlet = require("figlet")
const qrcode = require("qrcode-terminal")

console.log(figlet.textSync("Bothunt Bot"))

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth")
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
    })

    // Simpan kredensial
    sock.ev.on("creds.update", saveCreds)

    // === QR Handler (WAJIB AGAR QR TAMPIL) === //
    sock.ev.on("connection.update", (update) => {
        const { qr, connection, lastDisconnect } = update

        // Tampilkan QR di terminal
        if (qr) {
            console.log("Scan QR berikut:")
            qrcode.generate(qr, { small: true })
        }

        // Auto reconnect
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                start()
            } else {
                console.log("❌ Anda logout, scan ulang!")
            }
        } else if (connection === "open") {
            console.log("✅ BOT SUDAH ONLINE!")
        }
    })

    // === HANDLE PESAN MASUK === //
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        if (!text) return

        // PREFIX
        const prefix = "!"
        if (!text.startsWith(prefix)) return
        const cmd = text.slice(1).trim().split(" ")[0].toLowerCase()

        // === COMMANDS === //

        if (cmd === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" })
        }

        if (cmd === "menu") {
            await sock.sendMessage(from, { text: "✨ *BOT MENU*\n\n- !ping" })
        }
    })
}

start()
