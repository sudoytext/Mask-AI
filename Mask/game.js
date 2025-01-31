const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { token, guildId, monitoredChannelId, categoryId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const activeGamingChannels = new Map();

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const monitoredChannel = guild.channels.cache.get(monitoredChannelId);
    if (!monitoredChannel) return;

    const membersInChannel = monitoredChannel.members.size;

    if (membersInChannel === 4 && !activeGamingChannels.has(monitoredChannel.id)) {
        console.log("🎮 Creating a private gaming channel...");

        const gamingChannel = await guild.channels.create({
            name: 'Gaming-1',
            type: 2,
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.Connect],
                },
                ...monitoredChannel.members.map(member => ({
                    id: member.id,
                    allow: [
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.Stream
                    ]
                }))
            ]
        });

        console.log(`✅ Created private channel: ${gamingChannel.name}`);
        for (const [memberId, member] of monitoredChannel.members) {
            try {
                await member.voice.setChannel(gamingChannel);
                console.log(`✅ Moved ${member.user.tag} to ${gamingChannel.name}`);
            } catch (error) {
                console.error(`❌ Error moving ${member.user.tag}:`, error);
            }
        }

        activeGamingChannels.set(monitoredChannel.id, gamingChannel.id);
    }

    if (membersInChannel < 3 && activeGamingChannels.has(monitoredChannel.id)) {
        const gamingChannelId = activeGamingChannels.get(monitoredChannel.id);
        const gamingChannel = guild.channels.cache.get(gamingChannelId);

        if (gamingChannel) {
            console.log("🚮 Deleting private gaming channel in 5 seconds...");
            setTimeout(async () => {
                try {
                    await gamingChannel.delete();
                    console.log("✅ Private gaming channel deleted.");
                } catch (error) {
                    console.error("❌ Error deleting private channel:", error);
                }
            }, 5000);
        }

        activeGamingChannels.delete(monitoredChannel.id);
    }
});

client.login(token);
