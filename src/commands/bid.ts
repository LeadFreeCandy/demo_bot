import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bid')
        .setDescription('Immediately win the auction at the current price'),
    async execute(interaction: CommandInteraction) {
        // This command's logic is handled in the auction command's collector
        await interaction.reply('Bid placed!');
    },
};
