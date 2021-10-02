import {SlashCommand} from '@src/lib/util/SlashCommand';
import dayjs = require('dayjs');
import { Invite, MessageEmbed } from 'discord.js';


export default new SlashCommand(
    {
        name: 'lookup',
        description: 'lookup a server invite',
        options: [
            {
                name: 'invite',
                description: 'The invite',
                type: 'STRING',
                required: true
            }
        ]
    },

    (async (client, interaction) => {
        const code = interaction.options.getString('invite', true);
        let invite: Invite;
        try {
            invite = await client.fetchInvite(code);
        } catch (err) {
            await interaction.reply('Unknown Invite');
            return;
        }

        const guild = invite.guild;

        const embed = new MessageEmbed()
            .setTitle(`${guild!.name} (${guild!.id})`)
            .setThumbnail(guild!.iconURL({dynamic: true}) || '')
            .addField('Channel', `${invite.channel?.name} (${invite.channel?.id})`, false)
            .addField('Inviter', `${invite.channel?.name} (${invite.channel?.id})`, false)
            .addField('Guild Creation Date', dayjs(guild?.createdAt).format('DD:MM:YYYY hh:mm'), false)
            .addField('Verification Level', client.util.parseVerificationLevel(guild!), false)
            .addField('Features', client.util.parseGuildFeatures(guild!), false)
            .addField('Members', invite.memberCount.toString(), true)
            .addField('Online', invite.presenceCount.toString(), true);

        await interaction.reply({
            embeds: [embed]
        });

    })
);
