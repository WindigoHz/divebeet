module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);
    
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

module.exports.config = {
    name: 'pause',
    aliases: ['p', 'break', 'repos']
}