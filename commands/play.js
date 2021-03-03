const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const Discord = require('discord.js');


module.exports.run = async (client, message, args, queue, searcher) => {
    const voiceChannel = message.member.voice.channel;

    if(!voiceChannel)
        return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command. \`\`\``)

    let url = args.join('');
    if(url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        await ytpl(url).then(async playlist => {
            if(playlist.url <= 0)
                return message.send(`\`\`\`diff
- ❌ The playlist does not exist.\`\`\``);
            if(playlist.title <= 0)
                return message.send(`\`\`\`diff
- ❌ The playlist does not exist.\`\`\``);
            else{
                const p_embed = new Discord.MessageEmbed()
                    .setColor("#252525")
                    .setAuthor(message.author.username, message.author.displayAvatarURL())
                    .setTitle(playlist.title)
                    .setURL(playlist.url)
                    .setThumbnail(playlist.thumbnail)
                    .setDescription(`\`➕\` **Playlist added to queue**`)
                message.channel.send(p_embed)
                playlist.items.forEach(async item => {
                    await videoHandler(await ytdl.getInfo(item.shortUrl), message, voiceChannel, true);
                })
            }
        })

    }else {
        let result = await searcher.search(args.join(' '), { type: 'video'})
        if (result.first == null)
            return message.channel.send(`\`\`\`diff
- ❌ There is no result found.\`\`\``);

        let songInfo = await ytdl.getInfo(result.first.url);
        return videoHandler(songInfo, message, voiceChannel)
    }

    async function videoHandler(songInfo, message, voiceChannel, playlist = false) {
        const serverQueue = queue.get(message.guild.id)
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            vLength: songInfo.videoDetails.lengthSeconds,
            thumbnail: songInfo.videoDetails.thumbnails[3].url
        }
        if (!serverQueue) {
            const queueConstructor = {
                txtChannel: message.channel,
                vChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 10,
                playing: true,
                loopone: false,
                loopall: false,
                skipVotes: []
            }
            queue.set(message.guild.id, queueConstructor);
            queueConstructor.songs.push(song);
            try{
                let connection = await queueConstructor.vChannel.join();
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
            serverQueue.songs.push(song);
            if(playlist) return undefined

            //const user = message.author
            let dur = `${parseInt(song.vLength / 60)}:${song.vLength - 60 * parseInt(song.vLength / 60)}`
            const embed = new Discord.MessageEmbed()
                .setColor("#252525")
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setTitle(song.title)
                .setURL(song.url)
                .setThumbnail(song.thumbnail)
                .setDescription(`\`➕\` **Added to queue**`)
                .addFields(
                    //{ name: '\u200B', value: '\u200B' }
                    //{ name: 'Position in queue', value: '0' ,inline: true },
                    { name: 'Song Duration', value: `\`${dur}\`` },
                    //{ name: 'Estimated time until playing', value: 'X:x', inline: true }
                );
            return message.channel.send(embed)            
        }
    }
    function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if(!song) {
            serverQueue.vChannel.leave();
            queue.delete(guild.id);
            return;
        }
        serverQueue.txtChannel.send(`\`🎶\` **Now playing:  - \`${serverQueue.songs[0].title}\` -**`);
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () => {
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
}



module.exports.config = {
    name: 'play',
    aliases: ['run', 'p']
}