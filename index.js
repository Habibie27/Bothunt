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
sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
        const msg = messages[0]

        // Cek apakah pesan dari Channel WA (broadcast)
        if (msg.key.remoteJid === "status@broadcast" || msg.key.remoteJid?.includes("newsletter")) {
            
            // List emoji 1.000 random
            const emojiList = [
                "😂","🤣","😍","🔥","💀","😎","❤️","😱","🤯","👍","👎","💯","✨","🤡","🐧",
                "😆","😇","😋","🤩","😏","🤠","😴","🥶","🤖","🙀","🐤","😻","👀","😵","🤘",
                // kamu boleh nambahin sampai 1000 emoji
            ]

            // Ambil emoji random
            const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)]

            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    key: msg.key,
                    text: randomEmoji
                }
            })

            console.log("Reacted to channel message with:", randomEmoji)
        }

    } catch (e) {
        console.log("React error:", e)
    }
})
