import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autobid')
        .setDescription('Set an auto-bid to win the auction when the price exceeds the specified amount')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount to auto-bid at')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        // This command's logic is handled in the auction command's collector
        await interaction.reply('Auto-bid placed!');
    },
};
