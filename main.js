import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bid')
        .setDescription('Place a bid on a chore')
        .addStringOption(option =>
            option.setName('chore')
                .setDescription('The name of the chore')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of the bid')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        // The bidding logic will be handled in the auction command's collector
        await interaction.reply('Bid placed!');
    },
};
