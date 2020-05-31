require('dotenv').config();

const axios = require('axios').default;
const cheerio = require('cheerio');
const md5 = require('md5');

const dbPath = process.env.db || './db.json';
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json'/*, {syncOnWrite: false}*/);
if(Object.keys(db.JSON()).length === 0){
	db.set('fingerprint', '');
	db.set('posts', []);
	db.set('channel', []);
}

const url = 'https://www2.cksh.tp.edu.tw/category/news/news_1/?officeID=53';

class Post{
	/**
	 * Creat a Post Object
	 * @contructor
	 * @param {post} post - a cheerio's object, look like a jQuery object
	 * @return {Post} a object contain some info in this post
	 */
	constructor(post){
		let attr = post.children();
		this.date = attr.eq(0).text();
		this.title = attr.eq(1).children().text();
		this.url = attr.eq(1).children().attr('href');
		
		this.md5 = md5(this.url);
	}
}

/**
 *	@constructor
 *	@function getPost
 *	@description get post from cksh
 *	@return {Promise} pass a object {status} if status is 'new post' pass {status, post}
 */
const getPost = () => axios.get(url)
	.then(res => cheerio.load(res.data))
	.then($ => {
		let $allPost = $('.nt_table > tbody');
		let fingerprint = md5($allPost.children().children().text());

		// if not update
		if(db.get('fingerprint') === fingerprint){
			// console.log('no new post');	
			return new Promise(res => res({
				post: []
			}));
		}

		// new post
		/// add fingerprint to db
		// console.log('new post, fingerprint:', fingerprint);

		// get post title, content and url
		let posts = db.get('posts');
		let post = [];
		let newPost = [];
		$allPost.children().each((i, item) => post.push(new Post($(item))));
		if(posts.length > 0){
			let lastPost = posts[0];
			let updateNum = 0;
			for(let i in posts){
				if(post[i].md5 !== lastPost.md5){
					newPost.push(post[i]);
				}else break;
			}
			// console.log('newPost', newPost);
			newPost.reverse();
			for(let i in newPost){
				posts.unshift(newPost[i])
			}
		}

		db.set('fingerprint', fingerprint);
		db.set('posts', post);

		return new Promise(res => res({
			post: newPost
		}));
	})
	.catch(console.error);

module.exports = getPost;
