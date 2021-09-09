const {User, Chat} = require("../public/models");
const {connectDatabase} = require("../public/db");

!(async function(){

	let db = connectDatabase();

	let users = await User.findAll({
		include : Chat
	});

	console.log(users[0].chats);
}());