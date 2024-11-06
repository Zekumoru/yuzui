import { Events, Message } from 'discord.js';
import { DiscordEvent } from '../../types/DiscordEvent';
import logger from '../utils/logger';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;
    logger.info(message.content);
  },
} as DiscordEvent;
