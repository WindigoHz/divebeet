module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    const mVoiceChannel = message.guild.me.voice.channel;

    if(voiceChannel != mVoiceChannel) {
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


module.exports.config = {
    name: 'fskip',
    aliases: ['fs', 'fsk', 'fnext']
}