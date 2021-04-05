# Galnet News Discord Bot
This bot primarily uses the official API provided by Frontier Developments, at: https://cms.elitedangerous.com/api/galnet

### If you want, you can now [invite the Galnet News Discord bot](https://discord.com/api/oauth2/authorize?client_id=609713919644401664&permissions=523328&scope=bot) to your server.

Links:
- Frontier Forums: https://forums.frontier.co.uk/threads/568615/
- EDCodex Entry: http://edcodex.info/?m=tools&entry=503

For any status updates, I may post something at one of the previous links, or at my Twitter: [![Twitter](https://i.ibb.co/GRCdkR1/twitter.png)](https://twitter.com/Alien_Drew)

## Appearance
![Example](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/example.png?raw=true) | ![Information](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/information.png?raw=true)
-- | --

## Want to modify and run your own instance?
Since this bot was made with [Node.js](https://nodejs.org), you'll need to make sure to install the latest LTS version as that's what I've been using with this project.

### Initial Setup
1. If you don't already have git installed, please do so, and then run `git clone https://github.com/TheAlienDrew/galnet-news-discord-bot`.
2. Then, before trying to run the bot, you'll need to go into the folder and update the packages by running `npm update`.
3. Make sure you already have filled out a [new developer application with discord](https://discord.com/developers/applications) so you can retrieve the bot token, to put into config in the next step.
4. You'll need to go to the directory above the git clone (e.g. `../galnet-news-discord-bot`), and create a file named `galnet-news-discord-bot.config` containing the following, while replacing `[YOUR BOT TOKEN HERE]` with your application's bot token:
```json
{
        "BOT_TOKEN": "[YOUR BOT TOKEN HERE]"
}
```
5. Afterwards, you can go back into the git clone and start the bot with `npm start`. \* Not required, but I recommend using [pm2](https://www.npmjs.com/package/pm2) (or another production process manager) for node, as it'll make headless setup a lot easier.
6. Lastly, you'll need to go back to the developer applications website so you can create the bot invite link. I suggest using the permissions code `523328`, but at this time it only needs permissions for viewing channels, sending messages, embedding links, attaching files, using external emojis, and mentioning `@everyone`/`@here`/all roles. You'll want to make sure to also have the scope set to `bot`.
7. Then you can use the link, which should look something like `https://discord.com/api/oauth2/authorize?client_id=[your-client-id]&permissions=523328&scope=bot`, to add it to one server.

### Node.js Libraries Used
- **[discord.js](https://github.com/discordjs/discord.js)** - A powerful JavaScript library for interacting with the [Discord API](https://discord.com/developers/docs/intro).
- **[node-fetch](https://github.com/node-fetch/node-fetch)** - A light-weight module that brings the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to Node.js.
- **[rss-parser](https://github.com/rbren/rss-parser)** - A lightweight RSS parser, for Node and the browser.
- **[html-to-text](https://github.com/html-to-text/node-html-to-text)** - An advanced html to text converter.
- **[moment](https://github.com/moment/moment)** - Parse, validate, manipulate, and display dates in javascript.
- **[moment-precise-range-plugin](https://github.com/codebox/moment-precise-range)** - A moment.js plugin to display human-readable date/time ranges.
- **[sync-rpc](https://github.com/ForbesLindesay/sync-rpc)** - Run asynchronous commands synchronously by putting them in a separate process.

## Buy me a cup of coffee?
- [![patreon](https://i.ibb.co/BGGr9mL/patreon.png)](https://www.patreon.com/bePatron?u=8414636)
- [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/E1E845O3L)
