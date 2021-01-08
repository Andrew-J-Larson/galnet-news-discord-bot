const config = require('../galnet-news-discord-bot-config.json');
const { version, author, license } = require('./package.json');
const fs = require('fs');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const moment = require('moment'); require('moment-precise-range-plugin');
const { htmlToText } = require('html-to-text');

const client = new Discord.Client();

// CONSTANTS

// WEBSITES
const AUTHOR_URL = 'https://thealiendrew.github.io';
const PAYPAL_URL = 'https://paypal.me/AlienDrew';

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

const IN_JSON_FORMAT = '?_format=json';

const GITHUB_REPO_URL = 'https://github.com/TheAlienDrew/galnet-news-discord-bot';
const BOT_NAME = 'Galnet News';
const DEFAULT_PREFIX = 'gnn';
const NO_PERMISSION = "Sorry, but you don't have permissions for that command.";
const NOT_A_COMMAND = "Sorry, but that's not a command, please look at the help page."
const MAIN_BOT_COLOR = 0xFF9226; // LIGHTER_ORANGE = 0xFF9226; DARKER_ORANGE = 0xF07B05
const ED_DOMAIN = 'elitedangerous.com';
const ED_FRONTEND_URL = 'https://www.' + ED_DOMAIN + '/';
const ED_BACKEND_URL = 'https://cms.' + ED_DOMAIN + '/';
const ED_COMMUNITY_URL = 'https://community.' + ED_DOMAIN + '/';
const ED_NODE_URL_PREFIX = ED_BACKEND_URL + 'node/';
const GNN_ARTICLE_URL_PREFIX = ED_FRONTEND_URL + 'news/galnet/article/';
const GNN_ARTICLE_IMG_URL_PREFIX = 'https://hosting.zaonce.net/elite-dangerous/galnet/';
const GNN_ARCHIVE_URL_PREFIX = ED_COMMUNITY_URL + 'galnet/uid/';
const GNN_RSS_URL = ED_BACKEND_URL + 'galnet.rss';
const GNN_JSON_URL = ED_BACKEND_URL + 'api/galnet' + IN_JSON_FORMAT;
const WINGS_LOGO_ORANGE = ED_COMMUNITY_URL + 'sites/EDSITE_COMM/themes/bootstrap/bootstrap_community/css/images/WingsLogo_Orange.png';
const REAL_TO_GAME_YEAR_DIFF = 1286;
// FIX ME!!!
const FIRST_POST_DATE = '22-08-3304'; // FIX ME!!! Actually is 23-08-3304 and the actual first date ever was 05-07-3301
const FEED_INTERVAL_SPEED = 60000; // 1 minute in milliseconds
const HTML_TO_TEXT_OPTIONS = {
    wordwrap: null,
    formatters: {
        'customLineBreaks': function (elem, walk, builder, formatOptions) {
        builder.openBlock(formatOptions.leadingLineBreaks || 0);
            builder.closeBlock(formatOptions.trailingLineBreaks || 0);
        }
    },
    tags: { 'br': { format: 'customLineBreaks',
                    options: { trailingLineBreaks: 2 } },
            'p': { options: { trailingLineBreaks: 3 } } }
};

const NEWEST_POST_FILE = './newest-post.txt';

// BOT VARIABLES

let settings = {prefix: DEFAULT_PREFIX,
                feedServer: null,
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
    let settingsLoaded = false;
    let data;
    try {
        data = fs.readFileSync(SAVE_FILE, 'utf8');
        
        // loop through lines until correct setting is found or until end of file
        data.toString().split('\n').forEach(function(line, index, arr) {
            if (index === arr.length - 1 && line === "") return;
            console.log(index + ' ' + line);

            // check and load in settings
            let keys = Object.keys(settings);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let keyStart = key + '=';
                if (line.startsWith(keyStart)) {
                    settings[key] = line.substring(keyStart.length)
                    settingsLoaded++;
                }
            }
        });

        if (settingsLoaded == Object.keys(settings).length) console.log('Settings loaded successfully');
        else if (settingsLoaded) console.log('Some settings, but not all, were loaded successfully');
        else console.log('No settings found in file to load');
    } catch(err) {
        console.log('No settings file to load');
    }
    
    return settingsLoaded;
}

// save all bot settings
function saveSettings() {
    // create/overwrite existing save file
    let saveString = '';
    let keys = Object.keys(settings);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let keyStart = key + '=';
        if (settings[key]) saveString += keyStart + settings[key] + '\n';
    }

    // write to file
    try {
        fs.writeFileSync(SAVE_FILE, saveString);
        console.log('Settings saved successfully');
    } catch(err) {
        console.error(err);
    }
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

// sends and formats article post to discord, or to the feed channel if msg is null
function createArticlePost(msg, post) {
    // get the right and formatted information for title and body
    let title = (post.title.replace(/\s/g,'').length > 0) ? htmlToText(post.title, {wordwrap: null}).replace(/\r/g,'').trim() : null;
    let body = htmlToText(post.body, HTML_TO_TEXT_OPTIONS).replace(/\r/g,'').trim();
    let sentences = body.split('\n');
    // sometimes the title is in the body
    if (!title) {
        title = sentences.shift();
        // remove the newlines before the next sentence
        while (sentences[0] == '') sentences.shift();
    }
    // get the first sentence and separate from others
    let firstSentence = sentences.shift();
    let moreSentences = '\n' + sentences.join('\n');
    // escape discord markdown symbols
    title = escapeMarkdown(title);
    firstSentence = escapeMarkdown(firstSentence);
    moreSentences = escapeMarkdown(moreSentences);

    (async () => {
        // include the archive link (nice purpose for cases where articles have same slug article link)
        let postNodeLink = ED_NODE_URL_PREFIX + post.nid;
        let postNodeDataJSON = await fetch(postNodeLink + IN_JSON_FORMAT);
        let postNodeData = await postNodeDataJSON.json();
        let postLangCode = postNodeData.langcode[0].value;
        let postGUID = postNodeData.field_galnet_guid[0].value;
        // need to remove langcode from end if matched
        if (postGUID.endsWith(postLangCode)) postGUID = postGUID.slice(0, -(postLangCode.length));
        let postArchiveURL = GNN_ARCHIVE_URL_PREFIX + postGUID
        
        // start creating the embed
        const embed = new Discord.MessageEmbed()
          .setColor(MAIN_BOT_COLOR)
          .setAuthor(post.date)
          .setTitle('__' + title + '__')
          .setURL(GNN_ARTICLE_URL_PREFIX + post.slug)
          .setFooter(moment(post.date, 'DD MMM YYYY').subtract(REAL_TO_GAME_YEAR_DIFF, 'y').format('LL') + ' UTC');

        // conditionally set image if there is one
        if (post.image && post.image.indexOf(',') != 0) {
            let images = post.image.replace(/^,+/, '').split(',');
            let imageToCheck = GNN_ARTICLE_IMG_URL_PREFIX + images[0] + '.png';
            // only set the image if the file is online and working
            let imageExists = true;
            await fetch(imageToCheck).then((response) => {
                if (response.status >= 400 && response.status < 600) {
                  imageExists = false;
                }
            })
            if (imageExists) embed.attachFiles([imageToCheck]);
            //if (images.length > 1) embed.setImage(GNN_ARTICLE_IMG_URL_PREFIX + images[1] + '.png');
        }
        
        // need to size differently for posts larger than 2048 characters
        let archiveLink = '[Archived Post](' + postArchiveURL + ')';
        let description = (firstSentence.length > 0) ? ('**' + firstSentence + '**') : '';
        description += (moreSentences.length > 0) ? moreSentences : '';
        description += description ? ('\n\n**' + archiveLink + '**') : '';
        const desc = [];
        if (description.length > DESCRIPTION_LENGTH) {
            // need to make sure that the first chunk ends at a double newline
            let newDescription = description.substring(0, DESCRIPTION_LENGTH + 4);
            let firstChunkEnd = newDescription.lastIndexOf('\n\n');
            // fix the newDescription to match requirements, and get the extended description
            newDescription = description.substring(0, firstChunkEnd);
            let extDescription = description.substring(firstChunkEnd + 4);

            desc.push(newDescription);

            // need to dynamically create the new fields to overcome description/field string length restrictions
            while (extDescription.length != 0) {
                // similar chunking like in normal description
                let newFieldValue = extDescription.substring(0, FIELD_VALUE_LENGTH + 4);
                let iterationChunkEnd = newFieldValue.lastIndexOf('\n\n');
                newFieldValue = extDescription.substring(0, iterationChunkEnd);
                desc.push(newFieldValue);
                extDescription = extDescription.substring(iterationChunkEnd, iterationChunkEnd + 4);
            }
        } else desc.push(description);

        // conditionally set description if there is one
        embed.setDescription(desc[0]);

        // for each part of description beyond the character limit, include as fields
        if (desc.length > 1) {
            for (let i = 1; i < desc.length; i++) {
                embed.addField('\u200B', desc[i]);
            }
        }

        // send to feed channel if not part of msg
        if (!msg) {
            let server = client.guilds.cache.get(settings.feedServer);
            let channel = server.channels.cache.get(settings.feedChannel);
            try {
                channel.send(embed);
            } catch(err) {
                console.log(err);
            }
        } else msg.channel.send(embed);
    })();
}

// gets only the very most recent singular post from Galnet News
function getGnnTopPost(msg) {
    (async () => {
        let allNewsJSON = await fetch(GNN_JSON_URL);
        let allNews = await allNewsJSON.json();

        let post = allNews[0];

        // post new article to channel or feed channel if it was a feed
        createArticlePost(msg, post);
    })();
}

// gets posts from galnet news; gameDate forces it to grab the articles from a specific date
// if nothing is entered, it'll grab the newest post(s),
// [for feed] but if a postNode is entered, it'll show new old to new posts starting from and skipping postNode
function getGnnPosts(msg, gameDate, postNode) {
    const ALL_POST_DELAY = 1500;

    let DD_MM_YYYY = moment(gameDate, 'DD-MM-YYYY'),
        DD_MMM_YYYY = moment(gameDate, 'DD-MMM-YYYY');
    let gameDateMoment = (DD_MM_YYYY.isValid() ? DD_MM_YYYY : (DD_MMM_YYYY.isValid() ? DD_MMM_YYYY : null));
    if (gameDate && !gameDateMoment) {
        msg.channel.send('Invalid date entered, please put date in the correct format.');
        return;
    }

    (async () => {
        let allNewsJSON = await fetch(GNN_JSON_URL);
        let allNews = await allNewsJSON.json();
        // as long as we don't hage a postNode, we need a date to check against
        let checkDate = !postNode ? (gameDateMoment ? gameDateMoment.format('DD MMM YYYY').toUpperCase()
                                                    : allNews[0].date)
                                  : null;
        let post = null;

        // loop through all articles to find oldest with matching date
        const TOTAL_ARTICLES = allNews.length;
        let i = 0; // end index
        let j = 0; // start index
        let matched = false;
        while (!matched && i < TOTAL_ARTICLES) {
            post = allNews[i];
            let peekPost = i < (TOTAL_ARTICLES - 1) ? allNews[i + 1] : null;

            // if we have a date to check, else find postNode
            let currDate, peekDate;
            if (checkDate) {
                currDate = post.date == checkDate;
                peekDate = peekPost && (peekPost.date == checkDate);
                // need to include found node
                if (!currDate && peekDate) j = i + 1;
            } else if (postNode) {
                currDate = post.nid == postNode;
                peekDate = peekPost && (peekPost.nid == postNode);
                // need to exclude found node
                if (!currDate && peekDate) j = i;
            }
            if (currDate && !peekDate) matched = true;
            
            else i++;
        }

        // either start posting matching articles or a note about there being none
        if (matched) {
            let postIndex = 0;
            
            // need to either get a chunch of same date posts, or get posts after matched post
            if (checkDate) {
                // loop and send all articles that matched the date
                for (let k = i; k >= j; k--) {
                    setTimeout(function() {createArticlePost(msg, allNews[k])}, ALL_POST_DELAY * postIndex);

                    postIndex++;
                }
            } else if (postNode) {
                // loop and send all articles after the matched date
                for (let k = j; k >= 0; k--) {
                    setTimeout(function() {createArticlePost(msg, allNews[k])}, ALL_POST_DELAY * postIndex);

                    postIndex++;
                }
            }
        } else {
            msg.channel.send('Sorry, no articles exist for the date you entered.');
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
            setTimeout(function() {createArticlePost(msg, post)}, ALL_POST_DELAY * (seconds + 1));

            seconds++;
        }
    })(); 
}

// sets the channel for the feed, channel name/mention is optional
function setFeedChannel(msg, channelArg) {
    let channelId = null;
    let serverId = msg.guild.id;

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
            settings.feedServer = null;
            settings.feedChannel = null;
            msg.channel.send('The feed is now turned off.');
        } else {
            settings.feedServer = serverId;
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
    if (!settings.feedChannel) return false;   

    // check if we can even access the guild information
    let server = client.guilds.cache.get(settings.feedServer);
    if (!server || !server.available) return console.log('The server is not available.');

    // start checking for new posts
    let rssParser = new RSSParser(); 

    (async () => {
        let newPostAvailable = true;
        let feed = await rssParser.parseURL(GNN_RSS_URL);

        let theFirstPostLink = feed.items[0].link;
        let endingSlash = theFirstPostLink.lastIndexOf('/') + 1;
        let checkPostNode = theFirstPostLink.substring(endingSlash);

        // check for file existence before trying to load
        let data;
        try {
            data = fs.readFileSync(NEWEST_POST_FILE, 'utf8');
            
            // check first line of file with string of feed
            let filePostNode = data.toString().replace(/\n$/, '');
            if (checkPostNode == filePostNode) newPostAvailable = false;
        } catch(err) {
            console.log('Feed file will be initialized.');
        }
        // if there's still a new post available, save it
        if (newPostAvailable) {
            console.log(`Found a new post from Galnet News at: ${ED_NODE_URL_PREFIX}${checkPostNode}`);

            // write to file
            fs.writeFileSync(NEWEST_POST_FILE, checkPostNode + '\n', function (err) {
                if (err) return console.error(err);
            }); 

            // get post(s) after the last known post (via node compare) from json file
            getGnnPosts(null, null, checkPostNode);
        } else console.log(`No new post found, latest is still at: ${ED_NODE_URL_PREFIX}${checkPostNode}`);
        
        return newPostAvailable;
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
    
    // start interval checking of the RSS feed to update channel
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
              .setAuthor(BOT_NAME + ' v' + version)
              .setTitle('__Commands__')
              .setDescription(`To run a command: \`${settings.prefix} <command>\`\n\n` +
                `**help** - Brings up this help page\n` +
                `**ping** - Gets the ping time in milliseconds\n` +
                `**date [timeline date]** - Gets post(s) from a certain day, but the date format must either be in \`DD-MM-YYYY\` or \`DD-MMM-YYYY\`\n` +
                `**newest** or **latest** - Gets the latest post(s)\n` +
                `**top** - Works like newest, but only grabs the single most recent news post\n` +
                `**feedinfo** - Shows if the feed is on, and what channel it's set to`)
              .setThumbnail(WINGS_LOGO_ORANGE)
              .setFooter("Ping a mod/admin/owner of the server if there are problems with this bot.");

            // need to conditionally show admin commands            
            if (msg.member.hasPermission(ADMIN)) {
                embed.addField('__Admin Commands__',
                  `**all** - This will send all news posts, from oldest to newest (warning: usually takes a long time)\n` +
                  `**feed** [name / id / mention] - Sets the feed channel or toggles it off, no arguments uses the channel command was sent in\n` +
                  `**prefix** [no-whitespace-string] - Sets the prefix for the bot, no arguments shows the current prefix`);
            }

            // need this field added last
            embed.addField(`__Bot Information__`,
              `Creator: **[${author}](${AUTHOR_URL})**\n` +
              `Source Code: **[GitHub Repo](${GITHUB_REPO_URL})** (${license})\n` +
              `Donate: **[PayPal](${PAYPAL_URL})**`);
        
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

        // <===== BOT COMMANDS HERE =====> //

        // DATE
        else if (command === 'date') {
            console.log(`Executed date command`);
            getGnnPosts(msg, args[0]);
        }

        // NEWEST / LATEST
        else if (command === 'newest' || command == 'latest') {
            console.log(`Executed newest/latest command`);
            getGnnPosts(msg);
        }

        // TOP
        else if (command == 'top') {
            console.log(`Executed top command`);
            getGnnTopPost(msg);
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
