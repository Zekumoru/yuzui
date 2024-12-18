import { CacheType, Collection, Events, Interaction } from 'discord.js';
import logger from '../utils/logger';
import { createEvent, DiscordEvent } from '../../types/DiscordEvent';
import asyncExec from '../utils/async-exec';

export default createEvent({
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      interaction.reply({
        content: `Error: No command \`/${interaction.commandName}\` found.`,
        ephemeral: true,
      });
      return;
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 1;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps?.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
        return;
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

    const [_, error] = await asyncExec(command.execute(interaction));

    if (!error) return;

    // handle errors
    logger.error(error);

    const errorMessageContent = {
      content: 'There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessageContent);
    } else {
      await interaction.reply(errorMessageContent);
    }
  },
} as DiscordEvent);
