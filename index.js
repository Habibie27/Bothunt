const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const fs = require("fs")
const figlet = require("figlet")

console.log(figlet.textSync("Bothunt Bot"))

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth")
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        start()
      } else {
        console.log("❌ Anda logout, scan ulang!")
      }
    } else if (connection === "open") {
      console.log("✅ BOT SUDAH ONLINE!")
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text

    if (!text) return

    // COMMAND PREFIX
    const prefix = "!"
    const cmd = text.startsWith(prefix)
      ? text.slice(1).trim().split(" ")[0].toLowerCase()
      : ""

    // SIMPLE COMMAND EXAMPLE
    if (cmd === "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" })
    }

    if (cmd === "menu") {
      await sock.sendMessage(from, { text: "✨ *BOT MENU*\n• !ping" })
    }
  })
}

start()
