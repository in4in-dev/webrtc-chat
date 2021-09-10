const {User, Chat} = require("../public/models");
const {connectDatabase} = require("../public/db");

!(async function(){

	let db = connectDatabase();

	let u = await User.create({
		name : 'dick'
	});

	Chat.create({
		user
	})
	u.createChat({});

	let user = await User.findOne();

	await user.getChats();

	console.log(user.chats);
}());