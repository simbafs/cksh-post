require('dotenv').config();

const dbPath = process.env.db || './db.json';

const axios = require('axios').default;
const cheerio = require('cheerio');
const md5 = require('md5');
const fs = require('fs');
const db = require(dbPath);
const writeDB = fs.createWriteStream(dbPath);
const url = 'https://www2.cksh.tp.edu.tw/category/news/news_1/?officeID=53';

axios.get(url)
	.then(res => cheerio.load(res.data))
	.then($ => {
		let post = $('.nt_table > tbody');
		let fingerprint = md5(post.children().children().text());
		console.log(fingerprint);
		db.push(fingerprint);
		writeDB.write(JSON.stringify(db));
	})
	.catch(console.error);
