
//if (!process.env.token) {
//    console.log('Error: Specify token in environment');
//    process.exit(1);
//}

const Botkit = require('./lib/Botkit.js');
const os = require('os');
const fs = require('fs');
const download = require('download');
const https = require('https');
const del = require('delete');

var slackBotID = "YOUR_SLACKBOT_ID";
var channelID = "CHANNEL_ID"

var token = "SLACK_API_TOKEN";

var controller = Botkit.slackbot({
	debug: false,
});

var bot = controller.spawn({
	//token: process.env.token
	token: token
}).startRTM();


controller.on("direct_message", (bot, message) => {
	console.log("[direct_message] on");
	var now = new Date();
	var bot_name = "anonymous_bot: "+ now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/ "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

		bot.startConversation({  channel : channelID }, (err, convo) => {
			if(err){
				console.log(err)
			}

			else{
				var send_message = {
					type: "message",
					channel: channelID,
					text: message.text, //text: message.text,
					username: bot_name,
					thread_ts: null,
					reply_broadcast: null,
					parse: null,
					link_names: null,
					attachments: null,
					unfurl_links: null,
					unfurl_media: null,
					icon_url: null,
					icon_emoji: ":anonymous:",
					as_user: true
				};

				convo.say(send_message);
				bot.reply(message, "匿名で投稿しました。");
				console.log("message post");
			}//else
		});//bot.startConversation
});//controller.on


controller.on("file_shared", function(bot, message){
	//console.log(message)
	if(message.user_id != slackBotID){ //anonymous_bot自身の反応は無視する
		const messageObj = {
			token: token,
			file: message.file_id
		};

		bot.api.files.info(messageObj, function(err, res){
			if(err){
				console.log(err)
			}

			else{
				console.log("[file_shared] on");
				var now = new Date();
				var fileName = now.getFullYear()+":"+(now.getMonth()+1)+":"+now.getDate()+":"+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+".jpg";
				var fileDir = "~/slack_anonymous_bot/botkit/images/";
				var filePath = fileDir + fileName
				var fileURL = res.file.url_private_download;

				var options = {
					"method": "GET",
					"hostname": "files.slack.com",
					"path": fileURL,
					"rejectUnauthorized": "false",
					"headers": {
					"Authorization": "Bearer " + token
					}
				};

				var file = fs.createWriteStream(filePath);
				var responseSent = false;

				https.get(options, response => {
					response.pipe(file);
					file.on("finish", () => {
						file.close(() => {
							if(responseSent) return;
							responseSent = false;
						});//file.close
					});//file.on
				});//https.get
				console.log("file download");

				setTimeout(() => {
					const messageObj = {
			        file: fs.createReadStream(filePath),
			        filename: fileName,
			        title: fileName,
			        channels: channelID
			    };
					bot.api.files.upload(messageObj, function(err, res){
						if(err){
							console.log(err);
						}

						else{
							console.log("file upload");
						}
					});//bot.api.files

					setTimeout(() => {
						del([filePath], function(err, res){
							if(err){
								console.log(err);
							}

							else{
								console.log("file delete")
							}
						});//del
					}, 1000);//setTimeout
				},1000);//setTimeout





			}//else
		});//bot.api.files
	}//if

	console.log("finish");
});//controller.on
