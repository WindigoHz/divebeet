module.exports.run = (message) => {
    message.channel.send('Hey user!')
}

module.exports.config = {
    name: 'hello',
    aliases: ['hi', 'hey', 'yo']
}