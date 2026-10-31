const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const humanDelay = async (min, max) => await delay(rand(min, max));

const humanTyping = async (sock, jid, min, max) => {
    await sock.sendPresenceUpdate('composing', jid);
    await delay(rand(min, max));
    await sock.sendPresenceUpdate('paused', jid);
};

module.exports = { rand, delay, humanDelay, humanTyping };
