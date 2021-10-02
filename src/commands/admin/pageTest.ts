// https://media.giphy.com/media/xrZ1qcdBHqdJmE3FkU/giphy.gif

import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'page_test',
        description: 'Test the pagination'
    },

    async (client, interaction) => {
        client.util.randomElement([1, 2, 3, 4, 5, 6, 7]);
    }
);
