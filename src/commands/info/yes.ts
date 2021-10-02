import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Message, MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'yes',
        description: 'yes',
    },

    (async (client, interaction) => {
        await interaction.reply('yes');
    })
);
