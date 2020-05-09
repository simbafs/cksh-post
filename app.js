const boardcast = require('./boardcast.js');
const cron = require('node-cron');

cron('0 0 12 * * *', boardcast);
cron('0 0 16 * * *', boardcast);
