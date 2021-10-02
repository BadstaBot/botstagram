import {SlashCommand} from '@src/lib/util/SlashCommand';
import {Message, MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';
import {Logger} from '@src/lib/util/Logger';

export default new SlashCommand(
    {
        name: 'prune',
        description: 'Kick inactive members',
        requiresBot: true,
        options: [
            {
                name: 'days',
                description: 'Number of days of inactivity required to kick',
                required: false,
                type: 'INTEGER'
            },
            {
                name: 'reason',
                description: 'The reason for the prune',
                required: false,
                type: 'STRING'
            }
        ]
    },

    async (client, interaction) => {
        const days = interaction.options.getInteger('days', false) ?? 7;
        const reason = interaction.options.getString('reason', false) ?? undefined;

        const guild = interaction.guild!;

        const count = await guild.members.prune({
            days: days,
            dry: true,
            reason: reason
        });

        const embed = new MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`:warning: Are you sure you want to prune ${count} members?`);

        const msg = await interaction.reply({
            embeds: [embed],
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('confirm_prune')
                        .setLabel('Yes'),
                    new MessageButton()
                        .setStyle('SUCCESS')
                        .setCustomId('cancel_prune')
                        .setLabel('No'),
                ])
            ],
            fetchReply: true
        }) as Message;

        const awaitedButton = await msg.awaitMessageComponent({
            componentType: 'BUTTON',
            filter: clicker => clicker.user.id === interaction.user.id
        });

        if (awaitedButton.customId === 'cancel_prune') {
            return await awaitedButton.update({
                embeds: [new MessageEmbed().setColor(client.config.colors.success).setDescription(':x: Cancelled')],
                components: []
            });
        }

       const [_, execTime] = await Logger.calcExecTime(async () => {
           await guild.members.prune({
               days: days,
               dry: true,
               reason: reason
           });
       });

        return await awaitedButton.update({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setDescription(`Pruned ${count} members`)
                    .setFooter(`Took ${execTime}ms`)
            ],
            components: []
        });
    }
);
