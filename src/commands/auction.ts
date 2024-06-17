import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, Message } from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from '../config.json';
import chores from '../data/chores.json';

interface Chore {
    name: string;
    description: string;
    price: number;
    winner?: string;
    autoBidPrice?: number;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auction')
        .setDescription('Start an auction for chores'),
    async execute(interaction: CommandInteraction, client: any) {
        let auctionedChores: Chore[] = chores.map(chore => ({ ...chore, price: config.startingPrice }));
        let auctionInProgress = true;
        let currentChoreIndex = 0;
        let timeElapsed = 0;
        const participants = interaction.guild?.members.cache.filter(member => !member.user.bot).size || 1;

        await interaction.reply('Auction for chores has started!');

        const formatCurrency = (amount: number): string => {
            return `$${amount.toFixed(2)}`;
        };

        const updateChorePrice = (time: number): number => {
            return eval(config.priceIncreaseFunction.replace('time', time.toString()));
        };

        const createEmbed = (chore: Chore, participants: number) => {
            const embed = new EmbedBuilder()
                .setTitle(`Auction for: ${chore.name}`)
                .setDescription(chore.description)
                .addFields(
                    { name: 'Current Price', value: formatCurrency(chore.price), inline: true },
                    { name: 'You Will Pay If Auctioned', value: formatCurrency(chore.price / participants), inline: true }
                )
                .setColor('#0099ff')
                .setTimestamp();
            return embed;
        };

        const auctionNextChore = async () => {
            if (!auctionInProgress) return;

            const chore = auctionedChores[currentChoreIndex];
            let auctionMessage = await interaction.followUp({ embeds: [createEmbed(chore, participants)] }) as Message;

            const priceInterval = setInterval(async () => {
                if (!auctionInProgress) {
                    clearInterval(priceInterval);
                    return;
                }
                timeElapsed++;
                chore.price = updateChorePrice(timeElapsed);
                await auctionMessage.edit({ embeds: [createEmbed(chore, participants)] });

                if (chore.autoBidPrice && chore.price >= chore.autoBidPrice) {
                    auctionInProgress = false;
                    clearInterval(priceInterval);
                    chore.winner = chore.winner ?? "AutoBidder";
                    await interaction.followUp(`${chore.name} goes to ${chore.winner} for ${formatCurrency(chore.price)}`);
                    currentChoreIndex = (currentChoreIndex + 1) % auctionedChores.length;
                    timeElapsed = 0; // Reset time for the next chore
                    auctionNextChore();
                }

                if (chore.price > config.maxPrice) {
                    auctionInProgress = false;
                    clearInterval(priceInterval);
                    await interaction.followUp(`Auction ended as the price exceeded ${formatCurrency(config.maxPrice)}.`);
                }
            }, config.priceIncreaseInterval);

            client.on('interactionCreate', async i => {
                if (!i.isCommand()) return;

                if (i.commandName === 'bid' && i.user.username === interaction.user.username) {
                    chore.winner = i.user.username;
                    auctionInProgress = false;
                    clearInterval(priceInterval);
                    await interaction.followUp(`${i.user.username} has won ${chore.name} for ${formatCurrency(chore.price)}`);
                } else if (i.commandName === 'autobid' && i.user.username === interaction.user.username) {
                    const bidAmount = i.options.getInteger('amount');
                    chore.winner = i.user.username;
                    chore.autoBidPrice = bidAmount;
                    await i.reply(`${i.user.username} has set an auto-bid for ${chore.name} at ${formatCurrency(bidAmount)}`);
                }
            });
        };

        auctionNextChore();
    },
};
