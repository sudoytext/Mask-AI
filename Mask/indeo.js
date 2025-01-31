require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let isAIEnabled = false;

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('ready', async () => {
    await client.application.commands.create(new SlashCommandBuilder()
        .setName('moonchat')
        .setDescription('enables the AI chatbot system.')
    );
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'moonchat') {
        const embed = new EmbedBuilder()
            .setTitle('Enable MoonAPP AI System')
            .setDescription('Would you like to enable the MoonAPP AI system? 🤖')
            .setColor('#00bfff')
            .setFooter('You can disable the system anytime with the /disablemoonchat command.')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel('NO')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel('YES')
                    .setStyle(ButtonStyle.Success),
            );

        await interaction.reply({ content: 'Please choose below:', embeds: [embed], components: [row] });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'no') {
            await interaction.update({ content: 'You chose NOT to enable the AI system.', embeds: [], components: [] });
        }

        if (interaction.customId === 'yes') {
            isAIEnabled = true;
            await interaction.update({ content: 'You have enabled the AI chat system! 🗨️', embeds: [], components: [] });
        }
    }

    if (commandName === 'disablemoonchat') {
        isAIEnabled = false;
        await interaction.reply({
            content: 'MoonAPP AI system is now disabled. You can enable it again by using the `/moonchat` command.',
        });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (isAIEnabled) {
        try {
            const response = await openai.completions.create({
                model: 'text-davinci-003',
                prompt: message.content,
                max_tokens: 150,
            });

            const botReply = response.choices[0].text.trim();
            await message.reply(botReply);
        } catch (error) {
            console.error('Error:', error);
            await message.reply('Sorry, I encountered an error while processing your message.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
