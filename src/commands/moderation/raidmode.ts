import {SlashCommand} from '@src/lib/util/SlashCommand';
import {BotClient} from '@src/lib/BotClient';
import {CommandInteraction, GuildChannel, Message, MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'raidmode',
        description: 'Enable or disable Raid Mode',
        options: [
            {
                name: 'enable',
                description: 'Enable Raid Mode',
                type: 'SUB_COMMAND'
            },
            {
                name: 'disable',
                description: 'Disable Raid Mode',
                type: 'SUB_COMMAND'
            }
        ]
    },

    (async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand(true);

        switch (subcommand) {
            case 'enable':
                await _enable(client, interaction);
                break;
            case 'disable':
                await _disable(client, interaction);
                break;
        }
    })
);

async function _enable(client: BotClient, interaction: CommandInteraction) {
    const buttons = [
        new MessageButton()
            .setStyle('DANGER')
            .setLabel('Yes')
            .setCustomId('yes'),

        new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('No')
            .setCustomId('No')
    ];

    const msg = await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription('Are you sure you want to enable raid mode')
                .setFooter('This will lock all channels, set the verification to the highest and prevent new members joining')
        ],
        components: [
            new MessageActionRow().addComponents(buttons)
        ],
        fetchReply: true
    }) as Message;

    const awaitedButton = await msg.awaitMessageComponent({
        componentType: 'BUTTON',
        filter: clicker => clicker.user.id === interaction.user.id
    });

    if (awaitedButton.customId === 'no') {
        await awaitedButton.update({
            embeds: [
                new MessageEmbed()
                    .setColor(client.config.colors.success)
                    .setDescription(':x: Cancelled')
            ],
            components: [],
        });
        return;
    }

    const currentVerifLevel = interaction.guild!.verificationLevel;

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            raidmodeOldVerifLevel: currentVerifLevel,
            raidmodeEnabled: true
        }
    });

    await interaction.guild!.setVerificationLevel('VERY_HIGH');

    const filterCategorys: GuildChannel['type'][] = ['GUILD_CATEGORY', 'GUILD_VOICE'];

    for (const [_, channel] of interaction.guild!.channels.cache.filter(c => !filterCategorys.includes(c.type)).filter(c => c!.permissionsFor(interaction.guild!.roles.everyone.id)?.has('SEND_MESSAGES') || false)) {

        await (channel as GuildChannel).permissionOverwrites.edit(interaction.guild!.roles.everyone.id, {
            SEND_MESSAGES: false
        });
    }

    await interaction.editReply({
        embeds: [
            new MessageEmbed()
                .setColor(client.config.colors.success)
                .setDescription(':white_check_mark: Enabled Raid Mode')
        ],
        components: [],
    });
}

async function _disable(client: BotClient, interaction: CommandInteraction) {

}
