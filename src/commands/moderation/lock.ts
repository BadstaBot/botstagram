import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed, TextChannel} from 'discord.js';
import interaction from '@src/events/interaction';

export default new SlashCommand(
    {
        name: 'lock',
        description: 'Lock the channel',
        botPerms: 'MANAGE_CHANNELS',
        userPerms: 'MANAGE_CHANNELS',
        options: [
            {
                name: 'reason',
                description: 'The reason for the lock',
                required: false,
                type: 'STRING'
            }
        ]
    },

    (async (client, interaction) => {
        const reason = interaction.options.getString('reason', false) ?? 'No reason given';

        await (interaction.channel as TextChannel).permissionOverwrites.edit(interaction.guild!.roles.everyone, {
            SEND_MESSAGES: false
        }, {reason: `Locked by ${interaction.user.tag} for ${reason}`});

        const embed = new MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle('Channel Locked')
            .setDescription(`🔒 ${interaction.channel} has been locked by ${interaction.user}`)
            .setFooter(`Reason: ${reason}`);

        await interaction.reply({embeds: [embed]});
    })
);
