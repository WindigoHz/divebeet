module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    const mVoiceChannel = message.guild.me.voice.channel;

    if(!serverQueue) {
        return message.channel.send(`\`\`\`diff
- ❌ There is no music played. \`\`\``);
    }

    if(voiceChannel != mVoiceChannel){
        return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command. \`\`\``);
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send("**Disconnected** 📤");
}

module.exports.config = {
    name: 'stop',
    aliases: ['disconnect', 'leave', 'dc', 's']
}