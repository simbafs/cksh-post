require('dotenv').config();

const getPost = require('./getPost.js');
const simply = require('simply.js');
const cron = require('node-cron');

let boardcastPool = [];
let boardcastPoolID = [];

const dbPath = process.env.db || './db.json';
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');
if(Object.keys(db.JSON()).length === 0){
	db.set('fingerprint', '');
	db.set('posts', []);
	db.set('channel', []);
}else{
	boardcastPoolID = db.get('channel');
}

simply.login(process.env.DC_BOT_TOKEN);

/**
 *	get channel object when the bot restart
 *	@function
 *	@param {Array} boardcastPool - the pool contains channel object
 *	@param {Array} boardcastPoolID - the pool contains channel id
 */
function restoreChannel(boardcastPool, boardcastPoolID){
	boardcastPool.length = 0;
	for(let id of boardcastPoolID){
		boardcastPool.push(simply.client.channels.get(id));
	}
}

simply.on('ready', () => {
	restoreChannel(boardcastPool, boardcastPoolID);
});

simply.set('prefix', '!');
simply.echo('cp ping', 'pong');
simply.cmd('cp', (msg, arg) => {
	switch(arg[1]){
		case 'ping':
			msg.channel.send('pong!');
			break;
		case 'add': 
			if(!boardcastPoolID.includes(msg.channel.id)){
				msg.channel.send(`Add channel ${msg.channel.id}`);
				boardcastPool.push(msg.channel);
				boardcastPoolID.push(msg.channel.id);
				db.set('channel', boardcastPoolID)
			}else{
				msg.channel.send('This channel has added');
			}
			break;
		case 'help':
		default:
			msg.reply('this is help page');
	}
})

/** boardcast on a specific time */
function boardcast(boardcastPool){
	getPost()
		.then(console.log);
}

boardcast();
