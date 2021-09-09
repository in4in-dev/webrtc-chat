const {User, Chat} = require("../public/models");
const {connectDatabase} = require("../public/db");

!(async function(){

	let db = connectDatabase();

	let user = await User.findByPk(1, {
		include : Chat
	});

	console.log(user.createdAt);
}());