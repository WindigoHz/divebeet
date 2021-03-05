const Discord = require('discord.js');

module.exports.run = async (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    
    if(!serverQueue) {
        return message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);            
    }
    if(message.member.voice.channel != message.guild.me.voice.channel) {
        return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
    }

    let currentPage = 0;
    const embeds = embedGenerator(serverQueue, message)

    const queueEmbed = await message.channel.send(`queue page: ${currentPage + 1}/${embeds.length}`, embeds[currentPage])
    await queueEmbed.react('⬅️');
    await queueEmbed.react('➡️');

    const reactionFilter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && (message.author.id === user.id)
    const collector = queueEmbed.createReactionCollector(reactionFilter);
    collector.on('collect', (reaction, user) => {
        if(reaction.emoji.name === '➡️') {
            if(currentPage < embeds.length - 1) {
                currentPage += 1;
                queueEmbed.edit(`queue page: ${currentPage + 1}/${embeds.length}`, embeds[currentPage])
                message.reaction.resolve(reaction).users.remove(user);
            }
        }else if(reaction.emoji.name === '⬅️') {
            if(currentPage !== 0) {
                currentPage -= 1;
                queueEmbed.edit(`queue page: ${currentPage + 1}/${embeds.length}`, embeds[currentPage])
                message.reaction.resolve(reaction).users.remove(user);
            }
        }
    })

}

function embedGenerator(serverQueue, message) {
    const embeds = [];
    let currentPage = 0;
    let songs = 10;
    for (i = 1; i < serverQueue.songs.length; i += 10) {
        const current = serverQueue.songs.slice(i, songs)
        songs += 11;
        let j = i - 1;
        const info = current.map(song => `\`${++j}.\` [${song.title}](${song.url})`).join('\n')
        const user = message.author
        const q_embed = new Discord.MessageEmbed()
            .setAuthor(user.username, user.displayAvatarURL())
            .setTitle(`**Queue for ${message.guild.name}**`)
            .setDescription(`_Now playing_: [${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) \n \n _Upcoming_: \n ${info}`)
            .setFooter(`Page ${currentPage + 1}/${embeds.length}`, user.displayAvatarURL());
        embeds.push(q_embed)
    }
    return embeds;
}

module.exports.config = {
    name: 'queue',
    aliases: ['q']
}