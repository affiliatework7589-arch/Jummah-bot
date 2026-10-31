const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
});

require('dotenv').config();
const qrcodeTerminal = require('qrcode-terminal');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { inWindow, isPrivate } = require('./utils/filter');
const { rand, delay, humanDelay, humanTyping } = require('./utils/delay');
const { getReply } = require('./replies');
const { useMongoAuthState } = require('./utils/mongoAuth');

const DRY_RUN = process.env.DRY_RUN === 'true';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Karachi';
const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_NAMES = process.env.SESSION_NAMES.split(',');

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set in .env file');
    process.exit(1);
}

const repliedContacts = new Set();
const sessionReplyCount = new Map();
const sessionRetryCount = {};
const mongoClients = new Map();
const lastMessageCache = new Map(); // jid -> last message text

async function startSession(name) {
    let mongoClient;
    let authState;

    try {
        authState = await useMongoAuthState(MONGODB_URI, name);
        mongoClient = authState.close;
        mongoClients.set(name, mongoClient);
    } catch (err) {
        console.error(`[${name}] Failed to connect to MongoDB:`, err.message);
        return;
    }

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: authState.state,
        browser: ['Ubuntu', 'Chrome', '22.04'],
        markOnlineOnConnect: false,
        syncFullHistory: false
    });

    sock.ev.on('creds.update', authState.saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(`${new Date().toISOString()} [${name}] Scanning QR code...`);
            qrcodeTerminal.generate(qr, { small: true });
            console.log(`${new Date().toISOString()} [${name}] QR Code generated above. Scan it with WhatsApp.`);
            return;
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                const delayMs = Math.min(1000 * Math.pow(2, sessionRetryCount[name] || 0), 30000);
                sessionRetryCount[name] = (sessionRetryCount[name] || 0) + 1;
                console.log(`${new Date().toISOString()} [${name}] Session closed. Reconnecting in ${delayMs}ms...`);
                await delay(delayMs);
                startSession(name);
            } else {
                console.log(`${new Date().toISOString()} [${name}] Session closed and not reconnecting (logged out?).`);
            }
        } else if (connection === 'open') {
            sessionRetryCount[name] = 0;
            console.log(`${new Date().toISOString()} [${name}] Session connected.`);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe || m.type !== 'notify') return;

        const jid = msg.key.remoteJid;
        if (!isPrivate(jid)) {
            console.log(`${new Date().toISOString()} [${name}] Ignored group/broadcast: ${jid}`);
            return;
        }

        if (!inWindow(TIMEZONE)) {
            return;
        }

        if (repliedContacts.has(`${name}:${jid}`)) return;
        const count = sessionReplyCount.get(name) || 0;
        if (count >= 20) {
            console.log(`${new Date().toISOString()} [${name}] Limit hit for session.`);
            return;
        }

        console.log(`${new Date().toISOString()} [${name}] Processing private message from ${jid}`);

        // Cache the last message from this contact
        const msgText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (msgText) {
            lastMessageCache.set(jid, msgText);
        }

        if (DRY_RUN) {
            console.log(`${new Date().toISOString()} [${name}] DRY_RUN: Would reply to ${jid}`);
            return;
        }

        await humanDelay(10000, 20000);
        await sock.readMessages([msg.key]);
        await humanTyping(sock, jid, 4000, 7000);
        await sock.sendMessage(jid, { text: getReply() });

        repliedContacts.add(`${name}:${jid}`);
        sessionReplyCount.set(name, count + 1);
        console.log(`${new Date().toISOString()} [${name}] Replied to ${jid}`);
    });

    sock.ev.on('call', async (calls) => {
        for (const call of calls) {
            if (call.status !== 'offer') continue;
            if (!inWindow(TIMEZONE)) continue;

            console.log(`${new Date().toISOString()} [${name}] Incoming call from ${call.from}`);

            if (DRY_RUN) {
                console.log(`${new Date().toISOString()} [${name}] DRY_RUN: Would reject call from ${call.from}`);
                return;
            }

            try {
                await humanDelay(1500, 3000);
                await sock.rejectCall(call.id, call.from);

                await humanDelay(5000, 9000);
                await humanTyping(sock, call.from, 3000, 5000);

                // Smart reply based on cached message
                const lastMsg = lastMessageCache.get(call.from) || '';
                const greeting = /assalam/i.test(lastMsg) || /salam/i.test(lastMsg) || /aslam/i.test(lastMsg)
                    ? 'Walaikum Assalam! '
                    : 'Assalam o Alaikum! ';
                const callReply = `${greeting}Main abhi Jummah ki namaz ada kar raha hoon. 2:00 baje ke baad baat karta hoon, shukriya.`;

                await sock.sendMessage(call.from, { text: callReply });
                console.log(`${new Date().toISOString()} [${name}] Call rejected and replied to ${call.from}`);
            } catch (err) {
                console.log(`${new Date().toISOString()} [${name}] Failed to reject call or send message:`, err.message);
            }
        }
    });
}

console.log(`${new Date().toISOString()} Starting sessions: ${SESSION_NAMES.join(', ')}`);
SESSION_NAMES.forEach(startSession);
