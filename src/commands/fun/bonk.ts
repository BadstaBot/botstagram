// https://media.giphy.com/media/xrZ1qcdBHqdJmE3FkU/giphy.gif

import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'bonk',
        description: 'Bonk a user',
        options: [
            {
                name: 'user',
                description: 'The user',
                type: 'USER',
                required: true
            }
        ]
    },

    async (client, interaction) => {
           const user = interaction.options.getUser('user', true);

           const embed = new MessageEmbed()
               .setTitle(`${interaction.user.username} bonked ${user.username}`)
               .setImage('https://media.giphy.com/media/xrZ1qcdBHqdJmE3FkU/giphy.gif');

           await interaction.reply({embeds: [embed]});
    }
);
