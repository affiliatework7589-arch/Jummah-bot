const { DateTime } = require('luxon');

const isPrivate = (jid) => !jid.includes('@g.us') && !jid.includes('@broadcast') && !jid.includes('@newsletter') && jid !== 'status@broadcast';

const inWindow = (timezone) => {
    const now = DateTime.now().setZone(timezone);
    // Friday = 5, 13:15 to 14:00
    if (now.weekday !== 5) return false;
    const start = now.set({ hour: 13, minute: 15, second: 0, millisecond: 0 });
    const end = now.set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
    return now >= start && now <= end;
};

module.exports = { isPrivate, inWindow };
