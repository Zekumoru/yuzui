import { CacheType, Events, Interaction } from 'discord.js';
import { DiscordEvent } from '../../types/DiscordEvent';
import logger from '../utils/logger';
import asyncExec from '../utils/async-exec';

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    if (!command.autocomplete) return;

    const [_, error] = await asyncExec(command.autocomplete(interaction));
    if (!error) return;

    // handle errors
    logger.error(error, `Could not autocomplete command: ${command.data.name}`);
  },
} as DiscordEvent;
