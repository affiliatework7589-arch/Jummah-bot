const replies = [
    "Assalam o Alaikum! Main abhi Jummah ki namaz ada kar raha hoon. 2:00 baje ke baad aap ke message ka jawab dunga. Shukriya.",
    "Wa Alaikum Assalam! Abhi Jummah par hoon, thodi der mein 2 baje ke baad reply karta hoon. Shukriya.",
    "Assalam o Alaikum! Jummah ki namaz mein hoon, 2:00 ke baad inshaAllah jawab dunga."
];

const getReply = () => replies[Math.floor(Math.random() * replies.length)];

module.exports = { getReply };
