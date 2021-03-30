module.exports.run = (message) => {
    message.channel.send('Hey bro!')
    message.channel.send('How are you?')
}

module.exports.config = {
    name: 'hello',
    aliases: ['hi', 'hey', 'yo']
}