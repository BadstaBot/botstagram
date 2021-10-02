// https://media.giphy.com/media/xrZ1qcdBHqdJmE3FkU/giphy.gif

import {SlashCommand} from '@src/lib/util/SlashCommand';
import {regexes} from '@src/lib/constants';
import {Ban} from 'ksoft.js';
import {MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'gban',
        description: 'Report a ban to KSoft.Si',
        options: [
            {
                name: 'user',
                description: 'The reported user',
                type: 'USER',
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for the report',
                type: 'STRING',
                required: true
            },
            {
                name: 'proof',
                description: 'The the proof of the report (must be a Imgur URL)',
                type: 'STRING',
                required: true
            }
        ]
    },

    async (client, interaction) => {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const proof = interaction.options.getString('proof', true);

        if (!proof.match(regexes.imgur.image) && !proof.match(regexes.imgur.album)) {
            return await interaction.reply('Proof must be an Imgur image url (i.imgur.com/xyz.png/jpg) or an Imgur album url (imgur.com/a/xyz)');
        }

        const ban = new Ban()
            .setUser(user.id, user.username, user.discriminator)
            .setModerator(interaction.user.id)
            .setReason(reason, proof);

        const resp = await client.ksoft.bans.add(ban);

        if (!resp.success) {
            return await interaction.reply(`Something went wrong while reporting that user (${'message' in resp ? resp.message : 'Unknown Error'})`);
        }

        const embed = new MessageEmbed()
            .setColor(client.config.colors.success)
            .setTitle('User Reported')
            .setDescription(`${user.tag} was reported`)
            .setFooter('This is a service provided by KSoft.Si');

        return await interaction.reply({
            embeds: [embed]
        });


    }
);
