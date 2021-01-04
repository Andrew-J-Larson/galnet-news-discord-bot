const config = require('../galnet-news-discord-bot-config.json');
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const moment = require('moment'); require('moment-precise-range-plugin');
const { htmlToText } = require('html-to-text');

const client = new Discord.Client();

// CONSTANTS

// WEBSITES
const MY_WEBSITE_URL = 'https://thealiendrew.github.io';
const DONATE_URL = 'https://paypal.me/AlienDrew';

// STATUS TYPES
const PLAY = 'PLAYING';
const WATCH = 'WATCHING';
const LISTEN = 'LISTENING';
const STREAM = 'STREAMING';

// ADMIN PERMISSION
const ADMIN = 'MANAGE_MESSAGES';

// EMBED MAXES
const DESCRIPTION_LENGTH = 2048;
const FIELD_VALUE_LENGTH = 1024;
const FIELDS = 25;

// SAVE LOCATION
const SAVE_FILE = './settings.txt';

// BOT CONSTANTS

const GITHUB_REPO_URL = 'https://github.com/TheAlienDrew/galnet-news-discord-bot';
const DEFAULT_PREFIX = 'gnn';
const NO_PERMISSION = "Sorry, but you don't have permissions for that command.";
const NOT_A_COMMAND = "Sorry, but that's not a command, please look at the help page."
const LIGHTER_ORANGE = 0xFF9226;
const DARKER_ORANGE = 0xF07B05;
const MAIN_BOT_COLOR = LIGHTER_ORANGE;
const WINGS_LOGO_ORANGE = 'https://community.elitedangerous.com/sites/EDSITE_COMM/themes/bootstrap/bootstrap_community/css/images/WingsLogo_Orange.png';
const GNN_RSS_URL = 'https://cms.elitedangerous.com/galnet.rss';
const GNN_JSON_URL = 'https://https://cms.elitedangerous.com/api/galnet?_format=json';
const GNN_ARTICLE_URL_PREFIX = 'https://www.elitedangerous.com/news/galnet/article/';
const GNN_ARTICLE_IMG_URL_PREFIX = 'https://hosting.zaonce.net/elite-dangerous/galnet/';
const FIRST_POST_DATE = '22-08-3304'; // FIX ME!!! Actually is 23-08-3304 and the actual first date ever was 05-07-3301
const FEED_INTERVAL_SPEED = 60000; // 1 minute in milliseconds

const TOTAL_SETTINGS = 2;
const SETTINGS_STRINGS = {prefix: 'prefix=',
                          feedChannel: 'feedChannel='}
const NEWEST_POST_FILE = './newest-post.txt';

// BOT VARIABLES

let settings = {prefix: DEFAULT_PREFIX,
                feedChannel: null};

// FUNCTIONS

// in years, months, days, hours, minutes, seconds
function getHumanTime(ms) {
    // relies on Moment.js and the Moment-Precise-Range.js plug-in
    let TIME_WORDS = ["year", "month", "day", "hour", "minute", "second"];

    let future = moment().add(ms);
    let now = moment();
    let diff = moment.preciseDiff(now, future, true);

    let TIME_PARTS = new Array(6);
    let timeArray = [diff.years, diff.months, diff.days, diff.hours, diff.minutes, diff.seconds];
    timeArray.forEach(function(time, index) {
        if (time > 0) TIME_PARTS[index] = time + ' ' + TIME_WORDS[index] + (time > 1 ? 's' : '');
    });

    // need a sentence to send back
    let sentence = "";
    TIME_PARTS.forEach(function(timePart, index) {
        if (timePart) {
            if (index > 0 && sentence != "") sentence += ", ";
            sentence += timePart;
        }
    });
    sentence = sentence.replace(/,(?=[^,]*$)/, ", and");

    return sentence;
}

// returns the user from a mention
function getUserFromMention(mention) {
    if (!mention) return false;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) mention = mention.slice(1);

        return client.users.cache.get(mention);
    }
}

// returns the channel id from channel mention
function getChannelFromMention(mention) {
    if (!mention) return false;

    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        return mention;
    }
}

// escapes all discord markdown to return useful string
function escapeMarkdown(text) {
    let unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
    let escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
    return escaped;
}

// load all bot settings
function loadSettings() {
    // check for file existence before trying to load
    fs.readFile(SAVE_FILE, 'utf8', function(err, data) {
        let settingsLoaded = false

        if (err) {
            console.log('No settings file to load');
            return settingsLoaded;
        }

        // loop through lines until correct setting is found or until end of file
        data.toString().split('\n').forEach(function(line, index, arr) {
            if (index === arr.length - 1 && line === "") return;
            console.log(index + ' ' + line);

            // check and load in settings
            if (line.startsWith(SETTINGS_STRINGS.prefix)) {
                settings.prefix = line.substring(SETTINGS_STRINGS.prefix.length);
                settingsLoaded++;
            } else if (line.startsWith(SETTINGS_STRINGS.feedChannel)) {
                settings.feedChannel = line.substring(SETTINGS_STRINGS.feedChannel.length);
                settingsLoaded++;
            }
        });

        if (settingsLoaded == TOTAL_SETTINGS) console.log('Settings loaded successfully');
        else if (settingsLoaded) console.log('Some settings, but not all, were loaded successfully');
        else console.log('No settings found in file to load');
        return settingsLoaded;
    });
}

// save all bot settings
function saveSettings() {
    // create/overwrite existing save file
    let saveString = SETTINGS_STRINGS.prefix + settings.prefix + '\n' +
                     SETTINGS_STRINGS.feedChannel + settings.feedChannel + '\n';

    // write to file
    fs.writeFile(SAVE_FILE, saveString, function (err) {
        if (err) return console.log(err);
        console.log('Settings saved successfully');
    });
}

// set the prefix for the bot to use
function setPrefix(msg, prefix) {
    // either set or show the prefix
    if (prefix) {
        // don't save when it's not needed
        prefix = prefix.toLowerCase();
        if (prefix == settings.prefix) {
            msg.channel.send('The bot already has the prefix `' + prefix + '`.');
            return false;
        } else {
            settings.prefix = prefix;
            saveSettings();

            // need to update the status to use new prefix
            client.user.setPresence({
                status: 'available',
                activity: {
                    name: `${settings.prefix} help | for commands`,
                    type: PLAY,
                    url: GITHUB_REPO_URL
                }
            });

            msg.channel.send('The prefix has been set to `' + prefix + '`.');
            return true;
        }
    } else {
        msg.channel.send('The current prefix is `' + settings.prefix + '`.');
        return false;
    }

}

// BOT FUNCTIONS

// checks if date string is in correct format DD-MM-YYYY
function validNumberDateString(date) {
    if (!(date && typeof(date) === 'string')) return false;
    else {
        let pattern = /^([0-9]{2})\-([0-9]{2})\-([0-9]{4})$/;
        if (pattern.test(date)) return true;
        else return false;
    }
}

// checks if date string is in correct format DD-MON-YYYY
function validMonthDateString(date) {
    if (!(date && typeof(date) === 'string')) return false;
    else {
        let pattern = /^([0-9]{2})\-([A-Z]{3})\-([0-9]{4})$/;
        if (pattern.test(date)) return true;
        else return false;
    }
}

// get real date from game date, returns date object (in UTC)
function getRealDate(gameDate) {
    const DATE_DIFFERENCE = 1286;

    gameDate = gameDate.split('-');

    let realYear = parseInt(gameDate[2], 10) - DATE_DIFFERENCE;
    
    let newDate = [parseInt(gameDate[1], 10), parseInt(gameDate[0], 10), realYear].join('/');

    return newDate + ' UTC';
}

// convert "DD-MM-YYYY" date format to "DD MON YYYY" as used in game
function articleDateFormat(date) {
    const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    date = date.split('-');

    let newDate = [date[0], MONTH_NAMES[parseInt(date[1]) - 1], date[2]];

    return newDate.join(' ');
}

// convert "DD MON YYYY" game date format to "DD-MM-YYYY" as used in command
function commandDateFormat(date) {
    const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const zeroPad = (num, places) => String(num).padStart(places, '0');

    date = date.split(' ');

    let newDate = [date[0], zeroPad(MONTH_NAMES.indexOf(date[1]) + 1, 2), date[2]];

    return newDate.join('-');
}

// sends and formats article post to discord, or to the feed channel if msg is null
function createArticlePost(msg, post, gameDate) {
    // parse the HTML for the description
    const PAGE_BREAK = '<br />';
    let body = escapeMarkdown(post.body.replace(/<p>|<\/p>|\r?\n|\r/g,''));
    let firstPageBreak = body.indexOf(PAGE_BREAK);
    let descSentence1st = htmlToText(body.substring(0, firstPageBreak), {wordwrap: null});
    let descSentencesAfter = htmlToText(body.substring(firstPageBreak + PAGE_BREAK.length), {wordwrap: null});

    // need to size differently for posts larger that 2048 characters
    let description = ('**' + descSentence1st + '**\n' + descSentencesAfter).replace(/\n/g, '\n\n');
    const desc = [];
    if (description.length > DESCRIPTION_LENGTH) {
        let newDescription = description.substring(0, DESCRIPTION_LENGTH);
        let extDescription = description.substring(DESCRIPTION_LENGTH);

        desc.push(newDescription);

        // need to calculate how many fields to use
        let neededFields = Math.ceil(extDescription.length / FIELD_VALUE_LENGTH);
        for (let i = 0; i < neededFields; i++) {
            let atIndex = i*FIELD_VALUE_LENGTH;
            let lastString = neededFields - 1;

            let newFieldValue = i != lastString ? extDescription.substring(atIndex, atIndex + FIELD_VALUE_LENGTH) : extDescription.substring(atIndex);
            
            desc.push(newFieldValue);
        }
        
    } else if (descSentence1st.length != '') desc.push(description);

    const embed = new Discord.MessageEmbed()
      .setColor(MAIN_BOT_COLOR)
      .setTitle(post.title)
      .setURL(GNN_ARTICLE_URL_PREFIX + post.slug)
      .setFooter(post.date + ' • ' + getRealDate(gameDate));

    // conditionally set image if there is one
    if (post.image && post.image.indexOf(',') != 0) {
        let images = post.image.replace(/^,+/, '').split(',');
        embed.attachFiles([GNN_ARTICLE_IMG_URL_PREFIX + images[0] + '.png']);
        //if (images.length > 1) embed.setImage(GNN_ARTICLE_IMG_URL_PREFIX + images[1] + '.png');
    }

    // conditionally set description if there is one
    if (desc.length >= 1) {
        embed.setDescription(desc[0])

        // for each part of description beyond the character limit, include as fields
        if (desc.length > 1) {
            for (let i = 1; i < desc.length; i++) {
                embed.addField('\u200B', desc[i]);
            }
        }
    }

    // send to feed channel if not part of msg
    if (!msg) client.channels.cache.get(settings.feedChannel).send(embed);
    else msg.channel.send(embed);
}

// gets only the very most recent singular post from galnet news; gameDate forces it to grab article from specific date
function getGnnNewestPost(msg) {
    (async () => {
        let allNewsJSON = await fetch(GNN_JSON_URL);
        let allNews = await allNewsJSON.json();

        let post = allNews[0];

        // get date from the article
        let gameDate = commandDateFormat(post.date);
        // convert gameDate to format used in posts
        checkDate = articleDateFormat(gameDate);

        // post new article to channel or feed channel if it was a feed
        createArticlePost(msg, post, gameDate);
    })();
}

// gets posts from galnet news; gameDate forces it to grab the article(s) from a specific date
// if nothing is entered, it'll grab the newest post(s)
function getGnnPosts(msg, gameDate) {
    const ALL_POST_DELAY = 1500;

    let validNumberDate = false;
    let validMonthDate = false;
    if (gameDate) {
        // needed incase it contains a month
        gameDate = gameDate.toUpperCase();

        validNumberDate = validNumberDateString(gameDate);
        validMonthDate = validMonthDateString(gameDate);
        if (!validNumberDate && !validMonthDate) {
            msg.channel.send('Invalid date entered, please put date in format DD-MM-YYYY.');
            return;
        }
    }

    (async () => {
        let allNewsJSON = await fetch(GNN_JSON_URL);
        let allNews = await allNewsJSON.json();

        let post = null;

        // get requested article from date (depending on date type)
        if (gameDate && validMonthDate) gameDate = commandDateFormat(gameDate.replace(/-/g, ' '));
        else if (!gameDate) gameDate = commandDateFormat(allNews[0].date);
        // convert gameDate to format used in posts
        checkDate = articleDateFormat(gameDate);

        // loop through all articles to find oldest with matching date
        const TOTAL_ARTICLES = allNews.length;
        let i = 0; // end index
        let j = 0; // start index
        let matched = false;
        while (!matched && i < TOTAL_ARTICLES) {
            post = allNews[i];
            let peekPost = i < (TOTAL_ARTICLES - 1) ? allNews[i + 1] : null;
            let peekDate = peekPost && (peekPost.date == checkDate);

            if ((post.date != checkDate) && peekDate) j = i + 1;
            if ((post.date == checkDate) && !peekDate) matched = true;
            else i++;
        }

        // either start posting matching articles or a note about there being none
        if (matched) {
            // loop and send all articles that matched the date
            let matchedPseudoIndex = 0;
            for (let k = i; k >= j; k--) {
                setTimeout(function() {createArticlePost(msg, allNews[k], gameDate);}, ALL_POST_DELAY * matchedPseudoIndex);

                matchedPseudoIndex++;
            }
        } else {
            msg.channel.send('Sorry, no article(s) exist(s) for the date you entered.');
            return;
        }
    })();
}

// gets and posts all articles from galnet news in order from oldest to newest
function getAllGnnPosts(msg) {
    const ALL_POST_DELAY = 1500;

    (async () => {
        let allNewsJSON = await fetch(GNN_JSON_URL);
        let allNews = await allNewsJSON.json();

        const TOTAL_ARTICLES = allNews.length;
        let estimatedTime = getHumanTime(ALL_POST_DELAY * TOTAL_ARTICLES);
        msg.channel.send(`ATTENTION: Sending ${TOTAL_ARTICLES} news posts will take about ${estimatedTime} to complete`);

        let seconds = 0;
        for (let i = TOTAL_ARTICLES - 1; i >= 0; i--) {
            let post = allNews[i];
            let gameDate = commandDateFormat(post.date);
            setTimeout(function() {createArticlePost(msg, post, gameDate);}, ALL_POST_DELAY * (seconds + 1));

            seconds++;
        }
    })(); 
}

// sets the channel for the feed, channel name/mention is optional
function setFeedChannel(msg, channelArg) {
    let channelId = null;

    // check if the channel name is valid to a channel ID
    if (channelArg) {
        checkChannelMention = getChannelFromMention(channelArg);

        if (checkChannelMention) channelId = checkChannelMention;
        else if (channelArg.length > 1) {
            // check for one word name to get channel ID
            channelId = msg.guild.channels.cache.find(channel => channel.name === channelArg).id;

            // else check to see if we were given an id
            if (!channelId) channelId = msg.guild.channels.cache.find(channel => channel.id === channelArg).id;
        }
    } else {
        // use current channel
        channelId = msg.channel.id;
    }

    if (channelId) {
        if (channelId == settings.feedChannel) {
            settings.feedChannel = null;
            msg.channel.send('The feed is now turned off.');
        } else {
            settings.feedChannel = channelId;
            msg.channel.send('Automatic feed channel changed to ' + msg.guild.channels.cache.get(channelId).toString() + '.');
        }

        saveSettings();
        return true;
    } else {
        msg.channel.send("Sorry, that's either not a real channel or it was entered incorrectly.");
        return false;
    }
}

// this will check for new post updates
function checkUpdate() {
    // check if feedChannel is active
    if (settings.feedChannel) return false;

    let rssParser = new RSSParser();

    (async () => {
        let newPostAvailable = true;
        let feed = await rssParser.parseURL(GNN_RSS_URL);

        checkFirstPost = feed.items[0];
        checkPostLink = checkFirstPost.link;

        // check for file existence before trying to load
        fs.readFile(NEWEST_POST_FILE, 'utf8', function(err, data) {
            if (err) {
                console.log('Feed file will be initialized.');
            } else {
                // check first line of file with string of feed
                let filePostLink = data.toString().replace(/\n$/, '');
                if (checkPostLink == filePostLink) newPostAvailable = false;
            }

            // if there's still a new post available, save it
            if (newPostAvailable) {
                console.log('Found a new post from Galnet News.');

                // write to file
                fs.writeFile(NEWEST_POST_FILE, checkPostLink + '\n', function (err) {
                    if (err) return console.log(err);
                }); 

                // get post at index 0 from json file
                getGnnNewestPost(null);
            }
            return newPostAvailable;
        });
    })();
}

// MAIN START

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // load settings in first
    loadSettings();

    // set status after settings are loaded in
    client.user.setPresence({
        status: 'available',
        activity: {
            name: `${settings.prefix} help | for commands`,
            type: PLAY,
            url: GITHUB_REPO_URL
        }
    });

    // interval checking of the RSS feed to update channel
    checkUpdate();
    setInterval(function() {
        checkUpdate();
    }, FEED_INTERVAL_SPEED);
    console.log(`Feed checker interval started.`);
});

// command functions should be in here
client.on('message', msg => {
    if (msg.author.bot) return; // don't let bots control our bot!

    // check for prefix
    let before = msg.content.split(/ +/g).shift();
    let mentioned = getUserFromMention(before);
    let hasPrefix = before.toLowerCase() === settings.prefix;
    let hasMention = mentioned && msg.mentions.users.first() == client.user;
    if (hasPrefix || hasMention) {
        // useful information for commands, for the mention the 3 is for the '<@!>' characters
        const args = hasPrefix ? msg.content.slice(settings.prefix.length).trim().split(/ +/g)
                               : msg.content.slice(mentioned.id.length + 4).trim().split(/ +/g);  
        const command = args.shift().toLowerCase();

        // <===== COMMANDS HERE =====> //

        // HELP
        if (command === 'help') {
            console.log(`Executed help command`);
            const embed = new Discord.MessageEmbed()
              .setColor(MAIN_BOT_COLOR)
              .setTitle('Commands:')
              .setDescription(`**help** - Brings up this help page\n**ping** - Gets the ping time in milliseconds\n**website** - Links to the bot creator's, AlienDrew's, website\n**donate** - Links to the paypal donation link for the bot developer\n**githubrepo** - Links to the github repo for which this bot is being maintained under\n**date [timeline date]** - Gets post(s) from a certain day, but the date format must either be in \`DD-MM-YYYY\` or \`DD-MON-YYYY\`\n**newest** - Gets the latest post(s)\n**top** - Works like newest, but only grabs the single most recent news post\n**feedinfo** - Shows if the feed is on, and what channel it's set to`)
              .setThumbnail(WINGS_LOGO_ORANGE)
              .setFooter("Ping a mod/admin/owner of the server if there are problems with this bot.");

            // need to conditionally show admin commands            
            if (msg.member.hasPermission(ADMIN)) {
                embed.addField('Admin Commands:', `**all** - This will send all news posts, from oldest to newest (warning: usually takes a long time)\n**feed** [name / id / mention] - Sets the feed channel or turns it off if on that channel, no arguments uses the current channel\n**prefix** [no-whitespace-string] - Sets the prefix for the bot, no arguments shows the current prefix`);
            }

            // need this field added last
            embed.addField(`Prefix is \`${settings.prefix}\``, `For running a command:\n\t\`${settings.prefix} <command>\``);

            msg.channel.send(embed);
        }

        // PING
        else if (command === 'ping') {
            console.log(`Executed ping command`);
            msg.channel.send("Pinging...").then((msg)=> {
                msg.edit("Still pinging...").then((msg)=> {
                    msg.edit("Pong! `" + (msg.editedTimestamp - msg.createdTimestamp) + "ms`");
                })
            })
        }
        
        // WEBSITE
        else if (command === 'website') {
            console.log(`Executed website command`);
            msg.channel.send(`The following link will take you to my website where I link to some of my coding projects: ${MY_WEBSITE_URL}`);
        }
        
        // DONATE
        else if (command === 'donate') {
            console.log(`Executed donate command`);
            msg.channel.send(`If you'd like to support me, you can always donate/tip: ${DONATE_URL}`);
        }
        
        // GITHUB REPO
        else if (command === 'githubrepo') {
            console.log(`Executed githubrepo command`);
            msg.channel.send(`If you're looking to help add more features, or just want to run the bot on your own server check out the github repo: ${GITHUB_REPO_URL}`);
        }

        // <===== BOT COMMANDS HERE =====> //

        // DATE
        else if (command === 'date') {
            console.log(`Executed date command`);
            getGnnPosts(msg, args[0]);
        }

        // NEWEST
        else if (command === 'newest') {
            console.log(`Executed newest command`);
            getGnnPosts(msg);
        }

        // TOP
        else if (command == 'top') {
            console.log(`Executed top command`);
            getGnnNewestPost(msg);
        }
        
        // FEED INFO
        else if (command === 'feedinfo') {
            console.log(`Executed feedinfo command`);
            msg.channel.send(settings.feedChannel ? 'The feed is currently set to ' + msg.guild.channels.cache.get(settings.feedChannel).toString() + '.' : 'The feed is currently turned off.');
        }

        // <===== ADMIN ONLY COMMANDS =====> //

        // ALL
        else if (command === 'all') {
            if (!msg.member.hasPermission(ADMIN)) {
                console.log(`User doesn't have permission for command`);
                msg.channel.send(NO_PERMISSION);
                return;
            }
            console.log(`Executed all command`);
            getAllGnnPosts(msg);
        }

        // FEED
        else if (command === 'feed') {
            if (!msg.member.hasPermission(ADMIN)) {
                console.log(`User doesn't have permission for command`);
                msg.channel.send(NO_PERMISSION);
                return;
            }
            console.log(`Executed feed command`);
            setFeedChannel(msg, args[0]);
        }

        // PREFIX
        else if (command === 'prefix') {
            if (!msg.member.hasPermission(ADMIN)) {
                console.log(`User doesn't have permission for command`);
                msg.channel.send(NO_PERMISSION);
                return;
            }
            console.log(`Executed prefix command`);
            setPrefix(msg, args[0]);
        }

        // <===== END OF COMMANDS =====> //

        // NOT A COMMAND, or NO PERMISSION
        else {
            console.log(`Invalid command entered`);
            msg.channel.send(NOT_A_COMMAND);
        }
    } 
}); 

// MAIN END

client.login(config.BOT_TOKEN);
