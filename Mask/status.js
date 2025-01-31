const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const ms = require('ms');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get('1155445969161302116');
    if (!guild) {
        console.error('Guild not found.');
        return;
    }

    const memberCount = guild.memberCount;

    client.user.setActivity(`MoonKnight | Members: ${memberCount}`, {
        type: ActivityType.Streaming,
        url: 'https://discord.gg/gTbVSrEPyg',
    });

    client.user.setStatus('idle');
});

client.login(process.env.DISCORD_TOKEN);
