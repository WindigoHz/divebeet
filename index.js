//<==================================== INIT =====================================>//
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

const ytdl = require('ytdl-core');
const { YTSearcher } = require('ytsearcher');
const { getInfo } = require('ytdl-core');


const searcher = new YTSearcher({
    key: process.env.youtube_api,
    revealed: true
});

fs.readdir('./commands/', (e, f) => {
    if(e) return console.error(e);
    f.forEach(file => {
        if (!file.endsWith('.js')) return;
        console.log(`📄  ${file} has been loaded`)
        let cmd = require(`./commands/${file}`);
        let cmdName = cmd.config.name;
        client.commands.set(cmdName, cmd)
        cmd.config.aliases.forEach(alias => {
            client.aliases.set(alias, cmdName);
        })
    })
});

const queue = new Map();
//<===============================================================================>//


//<==================================== MAIN =====================================>//

// Message Event...
client.on('message', async (message) => {
    const prefix = ",";
    if(!message.content.startsWith(prefix)) return;
    const serverQueue = queue.get(message.guild.id);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
    if(!cmd) return;
    try {
        cmd.run(client, message, args, queue, searcher);
    }catch (err) {
        return console.error(err)
    }
})
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
//<===============================================================================>//
