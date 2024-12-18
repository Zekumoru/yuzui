import 'dotenv/config';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { argv, exit } from 'process';
import { DiscordCommand } from '../types/DiscordCommand';
import logger from './utils/logger';
import asyncExec from './utils/async-exec';

// check whether to deploy globally or locally to guild development
const isGlobal = argv.some(
  (option) => option === '--global' || option === '-g'
);

// get ids and tokens
const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID;

if (!isGlobal && !guildId) {
  logger.error(
    `Registration of local commands must have a provided guild id. Are you perhaps looking to register globally? Pass the '-g' or '--global' option.`
  );
  exit(1);
}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

// Grab all the commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default as DiscordCommand;

  if ('data' in command && 'execute' in command) {
    // Do not deploy commands that are for development only
    if (!(isGlobal && command.devOnly)) commands.push(command.data.toJSON());
  } else {
    logger.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
interface RestResult {
  length: number;
}

(async () => {
  logger.info(
    `Started refreshing${isGlobal ? ' globally ' : ' '}${
      commands.length
    } application (/) commands.`
  );

  const route = isGlobal
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId!);

  // The put method is used to fully refresh all
  // commands in the guild with the current set
  const [data, error] = await asyncExec(
    rest.put(route, { body: commands }) as Promise<RestResult>
  );

  if (!data) {
    logger.error(
      error,
      `An error has occurred while registering the commands.`
    );
    return;
  }

  logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
})();
