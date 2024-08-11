const fs = require('fs');
const readline = require('readline');
const { Client, GatewayIntentBits } = require('discord.js');

// Read token from file
const getToken = () => fs.readFileSync('token.txt', 'utf8').trim();

// Read config from JSON file
const getConfig = () => {
    const configFile = fs.readFileSync('config.json');
    return JSON.parse(configFile);
};

// Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Readline setup for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility colors
const resetText = '\x1b[0m';
const whiteText = '\x1b[37m';

// Commands
async function deleteAllChannels(guild) {
    const channels = guild.channels.cache.filter(c => c.isTextBased());
    
    // Delete all channels in parallel
    const deletePromises = channels.map(channel => channel.delete()
        .then(() => console.log(`${whiteText}Deleted channel ${channel.name}${resetText}`))
        .catch(error => console.error(`${whiteText}Failed to delete channel ${channel.name}: ${error}${resetText}`))
    );

    await Promise.all(deletePromises);
    console.log(`${whiteText}All channels deleted.${resetText}`);

    // Create a new channel after 5 seconds
    setTimeout(async () => {
        await guild.channels.create({ name: '.' });
        console.log(`${whiteText}Channel '.' created.${resetText}`);
        promptCommand(guild); // Return to command prompt after creating channel
    }, 5000);
}

async function createChannels(guild) {
    const { channelName } = getConfig();
    for (let i = 0; i < 100; i++) {
        await guild.channels.create({ name: channelName })
            .then(channel => console.log(`${whiteText}Created channel ${channel.name}${resetText}`))
            .catch(error => console.error(`${whiteText}Failed to create channel: ${error}${resetText}`));
    }
    console.log(`${whiteText}100 channels created.${resetText}`);
    promptCommand(guild); // Return to command prompt after creating channels
}

async function spamChannels(guild) {
    const { spamMessage, ping, spamCount } = getConfig();
    const channels = guild.channels.cache.filter(c => c.isTextBased());
    
    let messageContent = spamMessage;
    if (ping === 'OFF') {
        messageContent = spamMessage.replace(/@everyone|@here/g, ''); // Remove mentions if ping is OFF
    }

    const spamPromises = channels.map(channel => {
        return Promise.all(
            Array.from({ length: spamCount }, () => channel.send(messageContent))
        );
    });

    await Promise.all(spamPromises.flat());
    console.log(`${whiteText}Spam messages sent to all channels.${resetText}`);
    promptCommand(guild); // Return to command prompt after spamming channels
}

async function changeServerName(guild) {
    const { serverName } = getConfig();
    await guild.setName(serverName)
        .then(updated => console.log(`${whiteText}Server name changed to ${updated.name}${resetText}`))
        .catch(error => console.error(`${whiteText}Failed to change server name: ${error}${resetText}`));
    promptCommand(guild); // Return to command prompt after changing server name
}

async function setBotStatus() {
    const { status } = getConfig();
    await client.user.setActivity(status, { type: 'PLAYING' });
    console.log(`${whiteText}Bot status set to "${status}".${resetText}`);
    promptCommand(client.guilds.cache.first()); // Return to command prompt after setting status
}

function promptCommand(guild) {
    console.log('(1) delchat (2) createchat (3) spam (4) name (5) online');
    rl.question('Enter command number: ', async (command) => {
        switch (command) {
            case '1':
                await deleteAllChannels(guild);
                break;
            case '2':
                await createChannels(guild);
                break;
            case '3':
                await spamChannels(guild);
                break;
            case '4':
                await changeServerName(guild);
                break;
            case '5':
                await setBotStatus();
                break;
            default:
                console.log('Invalid command.');
                break;
        }
    });
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    rl.question('Enter Discord server ID: ', async (serverId) => {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            console.error(`${whiteText}Guild not found.${resetText}`);
            rl.close();
            return;
        }
        promptCommand(guild);
    });
});

client.login(getToken());
