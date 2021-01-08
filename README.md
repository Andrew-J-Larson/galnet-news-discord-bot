# galnet-news-discord-bot
DEV NOTE: So far most features are working as intended (except that I'm not registered with the official [Elite Dangerous API](https://cms.elitedangerous.com/api) yet, so it can't get posts past a certain amount), but I'm always open to input/merges to change or add new features/fix bugs! Currently the bot is not supported for working on more than one server on it's own until I get the time to give it a database, but for now it will work if you manually download and run it on your own PC or server.

Since this bot was made with [Node.js](https://nodejs.org), you'll need to make sure to install the latest LTS version as that's what I've been using with this project.

Before trying to run the bot, you'll need to update the packages by running `npm update`. Afterwards, you can start the bot with `npm start`.

Not required, but I recommend using [pm2](https://www.npmjs.com/package/pm2) (or another production process manager) for node, as it'll make headless setup a lot easier.

![Example](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/example.png?raw=true) | ![Information](https://github.com/TheAlienDrew/galnet-news-discord-bot/blob/main/images/information.png?raw=true)
-- | --

### Node.js Libraries Used
- **[discord.js](https://github.com/discordjs/discord.js)** - A powerful JavaScript library for interacting with the [Discord API](https://discord.com/developers/docs/intro).
- **[node-fetch](https://github.com/node-fetch/node-fetch)** - A light-weight module that brings the Fetch API to Node.js.
- **[rss-parser](https://github.com/rbren/rss-parser)** - A lightweight RSS parser, for Node and the browser.
- **[html-to-text](https://github.com/html-to-text/node-html-to-text)** - An advanced html to text converter.
- **[moment](https://github.com/moment/moment)** - Parse, validate, manipulate, and display dates in javascript.
- **[moment-precise-range-plugin](https://github.com/codebox/moment-precise-range)** - A moment.js plugin to display human-readable date/time ranges.
