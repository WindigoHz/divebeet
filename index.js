//<==================================== INIT =====================================>//
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js')
const client = new Discord.Client();

const ytdl = require('ytdl-core');

const { YTSearcher } = require('ytsearcher');
const { getInfo } = require('ytdl-core');
const searcher = new YTSearcher({
    key: process.env.youtube_api,
    revealed: true
});

const queue = new Map();
//<===============================================================================>//


//<==================================== MAIN =====================================>//

// Message Event...
client.on('message', async (message) => {
    const prefix = ",";
    if (!message.content.startsWith(prefix)) return;
    const serverQueue = queue.get(message.guild.id);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    switch(command){
        case 'play':
            execute(message, serverQueue);
            break;

        case 'stop':
            stop(message, serverQueue);
            break;
        case 'fskip':
            fskip(message, serverQueue);
            break;
        case 'skip':
            vskip(serverQueue);
            break
        case 'pause':
            pause(serverQueue);
            break;
        case 'resume':
            resume(serverQueue);
            break;
        case 'loop':
            Loop(args, serverQueue);
            break;
        case 'queue':
            Queue(serverQueue)
            break;
    }


    // Queue and Search...
    async function execute(message, serverQueue) {
        if(args.length <= 0) {
            return message.channel.send(`\`\`\`fix
> ⚠️ Please write the name of the song.\`\`\``);
        }
        let voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You need to be in a voice channel to use this command. \`\`\``);
        }else {
            let result = await searcher.search(args.join(" "), { type: "video"})
            message.channel.send(`📄 **Searching** 🔎 \`${args.join(" ")}\``);
            const songInfo = await ytdl.getInfo(result.first.url);
            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            };

            if(!serverQueue) {
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 25,
                    playing: true,
                    loopone: false,
                    loopall: false,
                    skipVotes: []
                };
                queue.set(message.guild.id, queueConstructor);

                queueConstructor.songs.push(song);

                try{
                    let connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    message.guild.me.voice.setSelfDeaf(true)
                    play(message.guild, queueConstructor.songs[0]);
                }catch (err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`\`\`\`diff
- ❌ Unable to join the voice channel.\`\`\`\n
${err}`);
                }
            }else {
                const user = message.author
                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setAuthor(user.username, user.displayAvatarURL())
                    .setTitle(song.title)
                    .setURL(song.url)
                    .setThumbnail('https://cdn.discordapp.com/emojis/814503071807438879.png?v=1')
                    .setDescription(`\`➕\` **Added to queue**`)
                    .addFields(
                        //{ name: '\u200B', value: '\u200B' }
                        //{ name: 'Position in queue', value: '0' ,inline: true },
                        //{ name: 'Song Duration', value: 'X:x', inline: true },
                        //{ name: 'Estimated time until playing', value: 'X:x', inline: true }
                    );
                serverQueue.songs.push(song);
                return message.channel.send(embed)
            }   
        }
    }

    // Play video...
    function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if(!song) {
            serverQueue.vChannel.leave();
            queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            serverQueue.txtChannel.send(`\`🎶\` **Playing  - \`${serverQueue.songs[0].title}\` -  Now**`);
            client.on('finish', () => {
                if(serverQueue.loopone) {
                    play(guild, serverQueue.songs[0]);
                }
                else if(serverQueue.loopall) {
                    serverQueue.songs.push(serverQueue.songs[0]);
                    serverQueue.songs.shift();
                }else {
                    serverQueue.songs.shift();
                }
                play(guild, serverQueue.songs[0]);
            })
    }

    // 📤 Bot disconnection
    function stop(message, serverQueue) {
        if(!serverQueue) {
            return message.channel.send(`\`\`\`diff
- ❌ There is no music played. \`\`\``);
        }

        if(message.member.voice.channel != message.guild.me.voice.channel){
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command. \`\`\``);
        }
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.channel.send("**Disconnected** 📤");
    }

    // ⏭️ Force Skip music
    function fskip(message, serverQueue) {
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }
        if(!serverQueue) {
            return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);            
        }

        let roleN = message.guild.roles.cache.find(role => role.name === "DJ");
        if(!message.member.roles.cache.get(roleN.id)) {
            return message.channel.send(`\`\`\`diff
- ⛔ You don't have the 'DJ' role to perform this command.\`\`\``);
        }
        serverQueue.connection.dispatcher.end();
        message.channel.send("⏭️ **Skipped**");

    }

    // ⏭️ Vote Skip music
    function vskip(serverQueue) {
        if(!serverQueue) {
            return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);
        }
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }

        let usersC = message.member.voice.channel.members.size;
        let required = Math.ceil(usersC / 2);

        if(serverQueue.skipVotes.includes(message.member.id)) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You already voted to skip...\`\`\``);
        }
        serverQueue.skipVotes.push(message.member.id);
        message.channel.send(`\`✔️\` **You voted to skip the song, \`[${serverQueue.skipVotes.length} / ${required}]\`**`)
        if(serverQueue.skipVotes.length >= required) {
            serverQueue.connection.dispatcher.end();
            serverQueue.skipVotes = [];
            message.channel.send('⏭️ **Skipped**');
        }
                
    }

    // ⏸️ Pause music
    function pause(serverQueue) {
        if(!serverQueue) {
        return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``)
        }          
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }
        if (serverQueue.connection.dispatcher.paused) {
            return message.channel.send(`\`\`\`markdown
# ❕ The video is already paused.\`\`\``);
        }
        serverQueue.connection.dispatcher.pause();
        message.channel.send("⏸️ **Pause**")

    }

    // ⏯️ Resume music
    function resume(serverQueue){
        if(!serverQueue) {
            return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);            
        }
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }
        if (serverQueue.connection.dispatcher.resumed) {
            return message.channel.send(`\`\`\`markdown
# ❕❕ The video is already playing.\`\`\``);
        }
        serverQueue.connection.dispatcher.resume();
        message.channel.send("⏯️ **Resuming** ")
    }

    // 🔄 Loop music
    function Loop(args, serverQueue) {
        if(!serverQueue) {
            return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);            
        }
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }
        if(args.length < 1) {
            return message.channel.send(`\`\`\`markdown
# ❕❕ Please specify what loop you want to use: <one/all/off>\`\`\``);
        }
        switch (args[0].toLowerCase()) {
            case 'all':
                serverQueue.loopall = !serverQueue.loopall;
                serverQueue.loopone = false;

                if(serverQueue.loopall === true) {
                    message.channel.send('🔁 **Loop all enabled:**  `🟢`')
                }else {
                    message.channel.send('🔁 **Loop all disabled:**  `🔴`')
                }
                break;
            case 'one':
                serverQueue.loopone = !serverQueue.loopone;
                serverQueue.loopall = false;

                if(serverQueue.loopone === true) {
                    message.channel.send('🔂 **Loop one enabled:** `🟢`')
                }else {
                    message.channel.send('🔂 **Loop one disabled:** `🔴`')
                }
                break;
            case 'off':
                serverQueue.loopall = false;
                serverQueue.loopone = false;
                message.channel.send('🔄 **Loop disabled:** `🔴`')
                break;
            default:
                message.channel.send(`\`\`\`markdown
# ❕❕ Please specify what loop you want to use: <one/all/off>\`\`\``)
        }
    }

    // 📜 Queue...
    function Queue(serverQueue) {
        if(!serverQueue) {
            return message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);            
        }
        if(message.member.voice.channel != message.guild.me.voice.channel) {
            return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
        }
        let nowPlaying = serverQueue.songs[0];
        let qMsg = `Now playing: ${nowPlaying.title}\n--------------------------\n`
        for (var i = 1; i < serverQueue.songs.length; i++) {
            qMsg += `${i}. ${serverQueue.songs[i].title}\n`
        }

        message.channel.send('```' + qMsg + '💡 Requested by: ' + message.author.username + '```')
    }
});

//<===============================================================================>//


//<========================== BOT STATUS & LOGIN ==========================>//
client.once('ready', () => {
    console.log(`The bot is connected as ${client.user.tag} ✅`);
    client.user.setStatus('online');
    setTimeout(() => {
        client.user.setActivity("Radiano 🎶", {type:'LISTENING'});   
    }, 100);
});

client.on('error', (error) => console.error());

client.login(process.env.token);
//<=========================================================================>//