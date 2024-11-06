import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { createCommand } from '../../types/DiscordCommand';
import openai from '../utils/openai';
import logger from '../utils/logger';
import languages from '../utils/languages';

let totalConsumedTokens = 0;
export default createCommand({
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translates the given message.')
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('The language to translate the message into.')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The message to translate.')
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('casual')
        .setDescription('Translate in a casual tone if true.')
    )
    .addBooleanOption((option) =>
      option
        .setName('ephemeral')
        .setDescription('Make the message visible to other users if true.')
    )
    .setContexts([
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),
  autocomplete: async (interaction) => {
    const focusedValue = interaction.options.getFocused();
    const choices = languages.map((lang) => `${lang.language} (${lang.code})`);
    const filtered = choices
      .filter((choice) =>
        choice.toLowerCase().startsWith(focusedValue.toLowerCase())
      )
      .slice(0, 25);

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  execute: async (interaction) => {
    const language = interaction.options.getString('language', true);
    const message = interaction.options.getString('message', true);
    const casual = interaction.options.getBoolean('casual') ?? false;
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Translate the following message in ${
            casual ? 'casual' : ''
          } ${language} carefully understanding its meaning to make the translation meaningful and natural. Do not add any remarks, your job is to only translate. Don't remove Discord tags like emojis, etc.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const translated = completion.choices[0].message.content;
    if (!translated) {
      logger.error(completion, `Empty translated content`);
      interaction.reply({
        content: `Something went wrong and couldn't translate.`,
        ephemeral: true,
      });
      return;
    }

    const username = interaction.user.username;
    const { total_tokens } = completion.usage!;
    totalConsumedTokens += total_tokens;
    logger.info(
      `${username} translated a message costing ${total_tokens} tokens. (Total: ${totalConsumedTokens} tokens)`
    );

    interaction.reply({
      content: translated,
      ephemeral,
    });
  },
});
