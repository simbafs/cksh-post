require('dotenv').config();

const dbPath = process.env.db || './db.json';

const axios = require('axios').default;
const cheerio = require('cheerio');
const md5 = require('md5');
const fs = require('fs');
let db;
if(fs.existsSync('./db.json') && fs.statSync('./db.json').size > 0) db = require('./db.json');
else db = {
	fingerprint: '',
	posts: [],
};
const url = 'https://www2.cksh.tp.edu.tw/category/news/news_1/?officeID=53';

function saveDB(db){
	fs.createWriteStream(dbPath).write(JSON.stringify(db));
}

class Post{
	constructor(post){
		let attr = post.children();
		this.date = attr.eq(0).text();
		this.title = attr.eq(1).children().text();
		this.url = attr.eq(1).children().attr('href');
		
		this.md5 = md5(this.url);
	}
}

const getPost = () => axios.get(url)
	.then(res => cheerio.load(res.data))
	.then($ => {
		let $allPost = $('.nt_table > tbody');
		let fingerprint = md5($allPost.children().children().text());

		// if not update
		if(db.fingerprint === fingerprint){
			console.log('no new post');	
			return new Promise(res => res($));
		}

		// new post
		/// add fingerprint to db
		console.log('new post, fingerprint:', fingerprint);

		// get post title, content and url
		let post = [];
		let newPost = [];
		$allPost.children().each((i, item) => post.push(new Post($(item))));
		if(db.posts.length > 0){
			let lastPost = db.posts[0];
			let updateNum = 0;
			for(let i in db.posts){
				if(post[i].md5 !== lastPost.md5){
					newPost.push(post[i]);
				}else break;
			}
			console.log('newPost', newPost);
			newPost.reverse();
			for(let i in newPost){
				db.posts.unshift(newPost[i])
			}
			db.fingerprint = fingerprint;
			
		}else{
			db.fingerprint = fingerprint;
			db.posts = post;
		}

		saveDB(db);	
	})
	.catch(console.error);
getPost();
