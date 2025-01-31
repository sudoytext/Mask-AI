require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const prefix = '#';

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'ban') {
            if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply('You do not have permission to ban members.');

            const userID = args[0];
            const user = message.guild.members.cache.get(userID) || message.mentions.users.first();
            if (!user) return message.reply('Please provide a valid user ID or mention a user to ban.');

            const reason = args.slice(1).join(' ') || 'No reason provided.';
            const member = message.guild.members.cache.get(user.id);

            if (member) {
                await member.ban({ reason });
                message.channel.send(`${user.tag} has been banned. Reason: ${reason}`);
            } else {
                message.reply('User not found.');
            }
        }

        if (command === 'kick') {
            if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply('You do not have permission to kick members.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user to kick.');
            const reason = args.join(' ') || 'No reason provided.';
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.kick(reason);
                message.channel.send(`${user.tag} has been kicked. Reason: ${reason}`);
            } else {
                message.reply('User not found.');
            }
        }

        if (command === 'mute') {
            if (!message.member.permissions.has('MUTE_MEMBERS')) return message.reply('You do not have permission to mute members.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user to mute.');
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.timeout(ms('10m'), 'Muted by admin'); // Example: mute for 10 minutes
                message.channel.send(`${user.tag} has been muted.`);
            } else {
                message.reply('User not found.');
            }
        }

        if (command === 'deafen') {
            if (!message.member.permissions.has('DEAFEN_MEMBERS')) return message.reply('You do not have permission to deafen members.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user to deafen.');
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.voice.setDeaf(true);
                message.channel.send(`${user.tag} has been deafened.`);
            } else {
                message.reply('User not found.');
            }
        }

        if (command === 'timeout') {
            if (!message.member.permissions.has('MODERATE_MEMBERS')) return message.reply('You do not have permission to timeout members.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user to timeout.');
            const member = message.guild.members.cache.get(user.id);
            if (member) {
                await member.timeout(ms('10m'), 'Timed out by admin'); // Timeout for 10 minutes
                message.channel.send(`${user.tag} has been timed out.`);
            } else {
                message.reply('User not found.');
            }
        }

        if (command === 'move') {
            if (!message.member.permissions.has('MOVE_MEMBERS')) return message.reply('You do not have permission to move members.');
            const user = message.mentions.users.first();
            const channelName = args[1]; // Target channel name
            if (!user) return message.reply('Please mention a user to move.');
            if (!channelName) return message.reply('Please provide the channel to move the user to.');
            const member = message.guild.members.cache.get(user.id);
            const channel = message.guild.channels.cache.find(ch => ch.name === channelName && ch.isVoice());
            if (!channel) return message.reply('Invalid voice channel.');

            if (member && channel) {
                await member.voice.setChannel(channel);
                message.channel.send(`${user.tag} has been moved to ${channel.name}.`);
            } else {
                message.reply('User or channel not found.');
            }

        }
        if (command === 'avatar') {
            const user = message.mentions.users.first() || message.author;
            const avatarEmbed = new EmbedBuilder()
                .setTitle(`${user.tag}'s Avatar`)
                .setImage(user.displayAvatarURL())
                .setColor('#00bfff');
            message.channel.send({ embeds: [avatarEmbed] });
        }


        if (command === 'stat') {
            const guild = message.guild;

            if (!guild) {
                return message.reply("Could not retrieve server information.");
            }

            try {
                const owner = await guild.fetchOwner();
                const members = guild.members.cache;

                const onlineMembers = members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle').size;
                const offlineMembers = members.filter(m => m.presence?.status === 'offline').size;
                const totalMembers = guild.memberCount;
                const creationDate = guild.createdAt.toDateString();
                const vanityLink = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : 'No vanity link';

                const statsEmbed = new EmbedBuilder()
                    .setTitle(`${guild.name} Server Information`)
                    .setThumbnail(guild.iconURL() || '')
                    .setImage(guild.bannerURL() || '')
                    .setColor('#00bfff')
                    .addFields(
                        { name: 'Owner', value: `${owner.user.tag}`, inline: true },
                        { name: 'Fake-member🤡', value: `${onlineMembers}`, inline: true },
                        { name: 'invalid Accounts', value: `${offlineMembers}`, inline: true },
                        { name: 'Total Members', value: `${totalMembers}`, inline: true },
                        { name: 'Vanity Link', value: vanityLink, inline: true },
                        { name: 'Creation Date', value: `${creationDate}`, inline: true }
                    );

                message.channel.send({ embeds: [statsEmbed] });
            } catch (error) {
                console.error(error);
                message.reply("An error occurred while fetching server information.");
            }
        }
        if (command === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setTitle('📚 List of Commands')
                .setColor('#00bfff')
                .setThumbnail('https://cdn.discordapp.com/avatars/508238167653089302/f58ee9d5617182f42cac2e23da71dbba.webp?size=1024') // Replace with your image URL
                .setDescription('Here are the available commands you can use:')
                .addFields(
                    { name: '🔨 =ban', value: 'Ban a user by ID or mention them.', inline: true },
                    { name: '👢 =kick', value: 'Kick a user by mentioning them.', inline: true },
                    { name: '🔇 =mute', value: 'Mute a user by mentioning them for 10 minutes.', inline: true },
                    { name: '🔊 =deafen', value: 'Deafen a user by mentioning them.', inline: true },
                    { name: '⏳ =timeout', value: 'Timeout a user by mentioning them for 10 minutes.', inline: true },
                    { name: '🔄 =move', value: 'Move a user to a specified voice channel by mentioning them.', inline: true },
                    { name: '🖼️ =avatar', value: 'Display the avatar of a mentioned user or the command sender.', inline: true },
                    { name: '📊 =stat', value: 'Display server statistics including online/offline members, server owner, and creation date.', inline: true },
                    { name: '❓ =help', value: 'Display this help message with a list of all commands.', inline: true }
                )
                .setFooter({ text: 'Use =<command> to execute a command.' });

            message.channel.send({ embeds: [helpEmbed] });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
