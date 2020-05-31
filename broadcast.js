require('dotenv').config();

const helpMsg = require('./helpMsg.js');
const getPost = require('./getPost.js');
const simply = require('simply.js');
const { MessageEmbed } = require('discord.js');
const cron = require('node-cron');

let broadcastPool = [];
let broadcastPoolID = [];

const dbPath = process.env.db || './db.json';
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');
if(Object.keys(db.JSON()).length === 0){
	db.set('fingerprint', '');
	db.set('posts', []);
	db.set('channel', []);
}else{
	broadcastPoolID = db.get('channel');
}

simply.login(process.env.DC_BOT_TOKEN);

/**
 *	get channel object when the bot restart
 *	@function
 *	@param {Array} broadcastPool - the pool contains channel object
 *	@param {Array} broadcastPoolID - the pool contains channel id
 */
function restoreChannel(broadcastPool, broadcastPoolID){
	broadcastPool.length = 0;
	for(let id of broadcastPoolID){
		broadcastPool.push(simply.client.channels.get(id));
	}
}

simply.on('ready', () => {
	restoreChannel(broadcastPool, broadcastPoolID);
});

simply.set('prefix', '!');
simply.set('activity', `Stay at ${process.env.at}`);
simply.cmd('cp', (msg, arg) => {
	switch(arg[1]){
		case 'ping':
			msg.channel.send('pong!');
			break;
		case 'add': 
			if(!broadcastPoolID.includes(msg.channel.id)){
				msg.channel.send(`Add channel ${msg.channel.id}`);
				broadcastPool.push(msg.channel);
				broadcastPoolID.push(msg.channel.id);
				setTimeout(() => db.set('channel', broadcastPoolID), 100);
			}else{
				msg.channel.send('This channel has added');
			}
			break;
		case 'remove':
			if(broadcastPoolID.includes(msg.channel.id)){
				msg.channel.send(`Remove channel ${msg.channel.id}`);
				broadcastPool = broadcastPool.filter(i => i.id !== msg.channel.id);
				broadcastPoolID = broadcastPoolID.filter(i => i !== msg.channel.id);
				console.log(broadcastPool);
				console.log(broadcastPoolID);
				setTimeout(() => db.set('channel', broadcastPoolID), 100);
			}else{
				msg.channel.send('This channel isn\'t in the list');
			}
			break;
		case 'check': 
			broadcast();
			break;
		case 'help':
		default:
			msg.channel.send(helpMsg);
	}
})

/** broadcast on a specific time */
function broadcast(){
	return getPost()
		.then(e => {
			console.group('getPost')
			console.log(e);
			console.log('channel', broadcastPool.length);
			console.log(broadcastPoolID);
			console.groupEnd();
			if(e.post.length > 0){
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
				broadcastPool.forEach(channel => channel.send(embed));
				*/
				let msg = 'New post!\n';
				for(let i of e.post){
					msg += `${i.title }\n\t${i.url}\n`;
				} 
				broadcastPool.forEach(channel => channel.send(msg));
				
			}else{
				console.log('no new post');
			}
		}).catch(console.error);
}

module.exports = broadcast;
