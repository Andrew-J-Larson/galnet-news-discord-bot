const config = require('../galnet-news-discord-bot-config.json');
const Discord = require('discord.js');

const client = new Discord.Client();

// needed async functions that need to work like sync functions
function asyncGetOwnerUsername() {
    return (ownerId) => {
        // Your async code here
        return client.users.fetch(ownerId).catch(() => null);
    }
}

// MAIN END

client.login(config.BOT_TOKEN);

module.exports = asyncGetOwnerUsername