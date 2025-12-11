// =============================================
//              BOTHUNT BOT INDEX.JS
//      Full Features: OWNER + VIP + MENU +
//      AUTO REACT PREMIUM + 100+ EMOJI
//         Owner: Rayyan (85659852467)
// =============================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys")

const fs = require("fs")

// ====================================================
//                     DATABASE VIP
// ====================================================
const vipFile = "./database/vip.json"
if (!fs.existsSync(vipFile)) fs.writeFileSync(vipFile, "[]")
let vip = JSON.parse(fs.readFileSync(vipFile))

function addVIP(number) {
    if (!vip.includes(number)) {
        vip.push(number)
        fs.writeFileSync(vipFile, JSON.stringify(vip, null, 2))
    }
}

function isVIP(number) {
    return vip.includes(number)
}

// ====================================================
//                     OWNER CONFIG
// ====================================================

const owners = ["85659852467"] // Owner: Rayyan

function isOwner(number) {
    return owners.includes(number)
}

// ====================================================
//                     ALL EMOJIS
// ====================================================

const allEmojis = [
"😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
"😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️",
"😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓",
"🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵",
"🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","💀","☠️","👻","👽","👾","🤖",
"💩","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
]

// ====================================================
//                 AUTO REACT PREMIUM
// ====================================================
async function autoReactPremium(sock, msg) {
    const emoji = allEmojis[Math.floor(Math.random() * allEmojis.length)]
    try {
        await sock.sendMessage(msg.key.remoteJid, {
            react: { text: emoji, key: msg.key }
        })
    } catch {}
}

// ====================================================
//                     MENU TEXT
// ====================================================
const menuText = `
🌟 *BOTHUNT MENU*
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📌 *Fitur Umum*
• .menu — Tampilkan menu
• .owner — Info owner
• .vip — Beli VIP

💎 *Fitur VIP*
• Auto React Premium
• Spam React 10x
• 100+ Emoji Full
• Update Fitur Gratis

👑 *Fitur Owner*
• .addvip <nomor>
• .listvip
• .bc <pesan>
`

// ====================================================
//                       BOT START
// ====================================================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const sender = msg.key.participant || from
        const senderNumber = sender.split("@")[0]

        // ====================================================
        //                     AUTO REACT VIP
        // ====================================================
        if (isVIP(senderNumber)) {
            await autoReactPremium(sock, msg)
        }

        // ====================================================
        //                     COMMAND MENU
        // ====================================================

        if (text === ".menu") {
            return sock.sendMessage(from, { text: menuText })
        }

        if (text === ".owner") {
            return sock.sendMessage(from, {
                text: `👑 *OWNER BOT*\nNama: Rayyan\nNomor: wa.me/85659852467`
            })
        }

        if (text === ".vip") {
            return sock.sendMessage(from, {
                text: `💎 *VIP BOTHUNT*  
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
✨ *Fitur VIP:*  
• Auto React Premium  
• Spam React 10x  
• Akses 100+ Emoji  
• Update Premium Gratis

🛒 *Beli VIP:*  
📞 wa.me/85659852467  
👑 Owner: Rayyan`
            })
        }

        // ====================================================
        //               OWNER COMMANDS
        // ====================================================

        if (text.startsWith(".addvip")) {
            if (!isOwner(senderNumber))
                return sock.sendMessage(from, { text: "❌ Kamu bukan owner!" })

            const num = text.split(" ")[1]
            if (!num) return sock.sendMessage(from, { text: "Contoh: .addvip 628xxxx" })

            addVIP(num)
            return sock.sendMessage(from, { text: `✔️ ${num} sekarang VIP.` })
        }

        if (text === ".listvip") {
            if (!isOwner(senderNumber))
                return sock.sendMessage(from, { text: "❌ Owner Only!" })

            let txt = "💎 *DAFTAR VIP*\n\n"
            vip.forEach((v, i) => (txt += `${i + 1}. ${v}\n`))

            return sock.sendMessage(from, { text: txt })
        }

        if (text.startsWith(".bc ")) {
            if (!isOwner(senderNumber))
                return sock.sendMessage(from, { text: "❌ Owner Only!" })

            const pesan = text.slice(4)
            const chats = await sock.groupFetchAllParticipating()
            const ids = Object.keys(chats)

            for (const id of ids) {
                await sock.sendMessage(id, { text: `📢 *Broadcast Owner:*\n${pesan}` })
            }

            return sock.sendMessage(from, { text: "✔️ Broadcast sukses!" })
        }

    })

    sock.ev.on("connection.update", (update) => {
        if (update.connection === "close") startBot()
    })
}

startBot()
