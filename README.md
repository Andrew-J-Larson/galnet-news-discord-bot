# Galnet News Discord Bot
DEV NOTE: So far most features are working as intended (except for the `api/galnet-all` not working for the moment, so I have to use the limited `api/galnet`), but I'm always open to input/merges to change or add new features/fix bugs!
```diff
- Currently the bot is not supported for working on more than one server on it's own until I get the time to give it a database, but for now it will work if you manually download and run it on your own PC or server.
```

Since this bot was made with [Node.js](https://nodejs.org), you'll need to make sure to install the latest LTS version as that's what I've been using with this project.

### Initial Setup
1. Before trying to run the bot, you'll need to update the packages by running `npm update`.
2. Make sure you already have filled out a [new developer application with discord](https://discord.com/developers/applications) so you can retrieve the bot token, to put into config in the next step.
3. You'll need to go to the directory above the git clone (e.g. `../galnet-news-discord-bot`), and create a file named `galnet-news-discord-bot.config` containing the following, while replacing `[YOUR BOT TOKEN HERE]` with your application's bot token:
```js
{
        "BOT_TOKEN": "[YOUR BOT TOKEN HERE]"
}
```
4. Afterwards, you can go back into the git clone and start the bot with `npm start`. \* Not required, but I recommend using [pm2](https://www.npmjs.com/package/pm2) (or another production process manager) for node, as it'll make headless setup a lot easier.
5. Lastly, you'll need to go back to the developer applications website so you can create the bot invite link. I suggest using the permissions code `523328`, but at this time it only needs permissions for viewing channels, sending messages, embedding links, attaching files, using external emojis, and mentioning `@everyone`/`@here`/all roles. You'll want to make sure to also have the scope set to `bot`.
6. Then you can use the link, which should look something like `https://discord.com/api/oauth2/authorize?client_id=[your-client-id]&permissions=523328&scope=bot`, to add it to one server.

### Appearance
![Example](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/example.png?raw=true) | ![Information](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/information.png?raw=true)
-- | --

### Node.js Libraries Used
- **[discord.js](https://github.com/discordjs/discord.js)** - A powerful JavaScript library for interacting with the [Discord API](https://discord.com/developers/docs/intro).
- **[node-fetch](https://github.com/node-fetch/node-fetch)** - A light-weight module that brings the Fetch API to Node.js.
- **[rss-parser](https://github.com/rbren/rss-parser)** - A lightweight RSS parser, for Node and the browser.
- **[html-to-text](https://github.com/html-to-text/node-html-to-text)** - An advanced html to text converter.
- **[moment](https://github.com/moment/moment)** - Parse, validate, manipulate, and display dates in javascript.
- **[moment-precise-range-plugin](https://github.com/codebox/moment-precise-range)** - A moment.js plugin to display human-readable date/time ranges.
