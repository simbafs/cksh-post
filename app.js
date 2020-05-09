const getPost = require('./getPost.js');
getPost()
	.then(e => {
		if(e.status == 'new post') console.log(e.post);
		else console.log(e.status);
	})
