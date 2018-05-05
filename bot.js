var Discord = require('discord.io');
var https = require('https');
var fs = require('fs');

var auth = require('./auth.json');
var package = require('./package.json');
var pubg = require('./modules/pubg');
var statgDb = require('./modules/db');
var logger = require('./modules/log').getLogger();
var cmder = require('./modules/cmd/cmder');


// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.discordToken,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    statgDb.init();

    logger.info("start listening for messages...");
});

bot.on('message', function (user, userID, channelID, message, evt) {

    try {
        cmder.processMessage(bot, statgDb, pubg, user, userID, channelID, message, evt);
    } catch (err) {
        logger.error(err);
    }
});