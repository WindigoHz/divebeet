module.exports.run = (message) => {
    message.channel.send('Hey!')
}

module.exports.config = {
    name: 'hello',
    aliases: ['hi', 'hey', 'yo']
}