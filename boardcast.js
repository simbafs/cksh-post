require('dotenv').config();

const helpMsg = require('./helpMsg.js');
const getPost = require('./getPost.js');
const simply = require('simply.js');
const { MessageEmbed } = require('discord.js');
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
				setTimeout(() => db.set('channel', boardcastPoolID), 100);
			}else{
				msg.channel.send('This channel has added');
			}
			break;
		case 'remove':
			if(boardcastPoolID.includes(msg.channel.id)){
				msg.channel.send(`Remove channel ${msg.channel.id}`);
				boardcastPool = boardcastPool.filter(i => i.id !== msg.channel.id);
				boardcastPoolID = boardcastPoolID.filter(i => i !== msg.channel.id);
				console.log(boardcastPool);
				console.log(boardcastPoolID);
				setTimeout(() => db.set('channel', boardcastPoolID), 100);
			}else{
				msg.channel.send('This channel isn\'t in the list');
			}
			break;
		case 'help':
		default:
			msg.channel.send(helpMsg);
	}
})

/** boardcast on a specific time */
function boardcast(){
	getPost()
		.then(e => {
			console.group('getPost')
			console.log(e);
			console.log('channel', boardcastPool.length);
			console.log(boardcastPoolID);
			console.groupEnd();
			 if(e.status === 'new post'){
				/*
				let embed = new MessageEmbed()
					.setColor([170, 87, 242])
					.setTitle('New Post !')
					.setDescrption('New Post from https://www2.cksh.tp.edu.tw/category/news/news_1/?officeID=53')
					.setFooter('Boardcast from https://github.com/simba-fs/cksh-post')
					.setImage('https://raw.githubusercontent.com/simba-fs/cksh-post/master/img/cksh-github-social.png')
				for(let i of e.post){
					msg.addField(i.title, i.url)
				}
				boardcastPool.forEach(channel => channel.send(embed));
				*/
				let msg = 'New post!\n';
				for(let i of e.post){
					msg += `${i.title }\n\t${i.url}\n`;
				}
				boardcastPool.forEach(channel => channel.send(msg));
				
			 }
		}).catch(console.error);
}

module.exports = boardcast;
