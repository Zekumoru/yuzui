import { Events } from 'discord.js';
import { createEvent } from '../../types/DiscordEvent';
import logger from '../utils/logger';

export default createEvent({
  name: Events.ClientReady,
  once: true,
  execute: async () => {
    logger.info('Yuzui is now running!');
  },
});
