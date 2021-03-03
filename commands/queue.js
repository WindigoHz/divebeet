module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    
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

module.exports.config = {
    name: 'queue',
    aliases: ['q', 'file', 'qu']
}