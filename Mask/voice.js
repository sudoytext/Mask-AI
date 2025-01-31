const { Client, GatewayIntentBits, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { token, guildId } = require('./config.json');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { getPreview } = require('spotify-url-info');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    const command = new SlashCommandBuilder()
        .setName('play')
        .setDescription('Join a voice channel and play music from YouTube or Spotify')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The YouTube or Spotify link to play')
                .setRequired(true)
        );

    await client.application.commands.create(command.toJSON(), guildId);
    console.log('Slash command /play has been registered!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    if (commandName === 'play') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Insufficient Permissions')
                .setDescription("You don't have permission to use this command.")
                .setTimestamp();

            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        const link = interaction.options.getString('link');
        console.log(`Received link: ${link}`);

        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply("You need to join a voice channel first!");

        let stream;
        let source = null;
        const play = require('play-dl');
        if (await play.validate(link) === 'yt_video') {
            console.log("✅ Valid YouTube link detected.");
            stream = ytdl(link, { filter: 'audioonly' });
            source = 'YouTube';
        } else if (link.includes('spotify.com')) {
            try {
                console.log("🔍 Checking Spotify link...");
                const trackInfo = await getPreview(link);
                console.log("🎵 Spotify track info:", trackInfo);

                if (trackInfo && trackInfo.audio) {
                    stream = trackInfo.audio;
                    source = 'Spotify';
                } else {
                    console.log("⚠️ No audio preview available for this Spotify track.");
                    return interaction.reply("Spotify tracks must have a preview URL.");
                }
            } catch (error) {
                console.error("❌ Error fetching Spotify track:", error);
                return interaction.reply("Could not fetch the Spotify track. Please check the link.");
            }
        } else {
            console.log("❌ Invalid link detected.");
            return interaction.reply("Invalid link. Please provide a valid YouTube or Spotify link.");
        }

        if (!stream) {
            return interaction.reply("Sorry, I couldn't retrieve an audio stream for that link.");
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('✅ Bot connected to voice channel.');
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(stream);

        player.play(resource);
        connection.subscribe(player);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎶 Now Playing')
            .setDescription(`Playing from **${source}**:\n[Click here to view](${link})`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
});

client.login(token);
