import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { createCommand } from '../../types/DiscordCommand';
import logger from '../utils/logger';

export default createCommand({
  data: new SlashCommandBuilder()
    .setName('relay')
    .setDescription('Relays given message through the bot.')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The message to relay.')
        .setRequired(true)
    )
    .setContexts([
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),
  execute: async (interaction) => {
    const message = interaction.options.getString('message', true);
    await interaction.reply(message);
  },
});
