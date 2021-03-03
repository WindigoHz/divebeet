module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel;
    const mVoiceChannel = message.guild.me.voice.channel;

    if(!serverQueue) {
        return  message.channel.send(`\`\`\`diff
- ❌ There is no music played.\`\`\``);
    }
    if(voiceChannel != mVoiceChannel) {
        return message.channel.send(`\`\`\`fix
> ⚠️ You have to join a voice channel first to use this command.\`\`\``);
    }

    let usersC = voiceChannel.members.size;
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


module.exports.config = {
    name: 'skip',
    aliases: ['s', 'sk', 'next']
}