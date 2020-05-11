const broadcast = require('./broadcast.js');
const cron = require('node-cron');

cron.schedule('0 0 12,16 * * *', broadcast, {timezone: "Asia/Taipei"});
// broadcast().then(console.log, console.error);
