module.exports.run = (client, message, args, queue, searcher) => {

    const serverQueue = queue.get(message.guild.id);

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
                message.channel.send('🔁 **Loop all enabled:**  `🟢`');
            }else {
                message.channel.send('🔁 **Loop all disabled:**  `🔴`');
            }
        break;
    case 'one':
        serverQueue.loopone = !serverQueue.loopone;
        serverQueue.loopall = false;

        if(serverQueue.loopone === true) {
            message.channel.send('🔂 **Loop one enabled:** `🟢`');
        }else {
            message.channel.send('🔂 **Loop one disabled:** `🔴`');
        }
        break;
    case 'off':
        serverQueue.loopall = false;
        serverQueue.loopone = false;
        message.channel.send('🔄 **Loop disabled:** `🔴`');
        break;
    default:
        message.channel.send(`\`\`\`markdown
# ❕❕ Please specify what loop you want to use: <one/all/off>\`\`\``);
        }
}

module.exports.config = {
    name: 'loop',
    aliases: ['l']
}