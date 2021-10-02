import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed, TextChannel} from 'discord.js';
import interaction from '@src/events/interaction';

export default new SlashCommand(
    {
        name: 'unlock',
        description: 'Unock the channel',
        botPerms: 'MANAGE_CHANNELS',
        userPerms: 'MANAGE_CHANNELS',
        options: [
            {
                name: 'reason',
                description: 'The reason for the unlock',
                required: false,
                type: 'STRING'
            }
        ]
    },

    (async (client, interaction) => {
        const reason = interaction.options.getString('reason', false) ?? 'No reason given';

        await (interaction.channel as TextChannel).permissionOverwrites.edit(interaction.guild!.roles.everyone, {
            SEND_MESSAGES: true
        }, {reason: `Unlocked by ${interaction.user.tag} for ${reason}`});

        const embed = new MessageEmbed()
            .setColor(client.config.colors.success)
            .setTitle('Channel Unlocked')
            .setDescription(`🔓 ${interaction.channel} has been unlocked by ${interaction.user}`)
            .setFooter(`Reason: ${reason}`);

        await interaction.reply({embeds: [embed]});
    })
);
