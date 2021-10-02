// https://media.giphy.com/media/xrZ1qcdBHqdJmE3FkU/giphy.gif

import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageActionRow, MessageButton, MessageEmbed, TextChannel} from 'discord.js';

export default new SlashCommand(
    {
        name: 'report',
        description: 'Report a user',
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
                description: 'The the proof of the report',
                type: 'STRING',
                required: true
            }
        ]
    },

    async (client, interaction) => {
        const cfg = await client.prisma.guildConfig.findFirst({where: {gid: interaction.guildId!}});

        const reportChannelID = cfg!.reportchannel;

        if (!reportChannelID) {
            return await interaction.reply('The report channel is not set.');
        }

        const reportChannel = interaction.guild!.channels.resolve(reportChannelID) as TextChannel | null;

        if (!reportChannel) {
            await client.prisma.guildConfig.update({data: {reportchannel: null}, where: {gid: interaction.guildId!}});
            return await interaction.reply('The report channel is not set.');
        }

        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const proof = interaction.options.getString('proof', true);

        const embed = new MessageEmbed()
            .setColor(client.config.colors.warning)
            .setTitle('User Reported')
            .addField('User', `${user.tag} (${user.id})`, false)
            .addField('Reported By', `${interaction.user.tag} (${interaction.user.id})`, false)
            .addField('Reason', reason, false)
            .addField('Proof', proof, false);

        const buttons = [
            new MessageButton()
                .setLabel('Ban')
                .setEmoji('🔨')
                .setStyle('SECONDARY') //TODO play with styles
                .setCustomId(`user_report:ban:${interaction.guildId!}:${user.id}:${reason}`),
            new MessageButton()
                .setLabel('Kick')
                .setEmoji('👢')
                .setStyle('SECONDARY') //TODO play with styles
                .setCustomId(`user_report:kick:${interaction.guildId!}:${user.id}:${reason}`),
            new MessageButton()
                .setLabel('Warn')
                .setEmoji('⚠️')
                .setStyle('SECONDARY') //TODO play with styles
                .setCustomId(`user_report:warn:${interaction.guildId!}:${user.id}:${reason}`),
            new MessageButton()
                .setLabel('Mute')
                .setEmoji('🔇')
                .setStyle('SECONDARY') //TODO play with styles
                .setCustomId(`user_report:mute:${interaction.guildId!}:${user.id}:${reason}`),
            new MessageButton()
                .setLabel('Ignore')
                .setEmoji('❌')
                .setStyle('SECONDARY') //TODO play with styles
                .setCustomId(`user_report:ignore:${interaction.guildId!}:${user.id}:${reason}`),
        ];

        await reportChannel!.send({
            embeds: [embed],
            components: [new MessageActionRow().addComponents(buttons)]
        });

        await interaction.reply({
            content: `Reported ${user.tag}`,
            ephemeral: true
        });
    }
);
