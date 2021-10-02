import {SlashCommand} from '@src/lib/util/SlashCommand';
import {BotClient} from '@src/lib/BotClient';
import {CommandInteraction, GuildChannel} from 'discord.js';

export default new SlashCommand(
    {
        name: 'starboard',
        description: 'Manage the starboard',
        options: [
            {
                name: 'enable',
                description: 'Enable the starboard',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'channel',
                        description: 'The channel the stared message should go in',
                        type: 'CHANNEL',
                        required: true
                    }
                ]
            },
            {
                name: 'disable',
                description: 'Disable the starboard',
                type: 'SUB_COMMAND'
            },
            {
                name: 'minimum',
                description: 'Enable the starboard',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'min',
                        description: 'The minimum number of reactions the message needs',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: 'emoji',
                description: 'Set the emoji',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'emoji',
                        description: 'The emoji',
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]

    },

    (async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand(true);

        switch (subCommand) {
            case 'enable':
                await _enable(client, interaction);
                break;
            case 'disable':
                await _disable(client, interaction);
                break;
            case 'minumum':
                await _minimum(client, interaction);
                break;
            case 'emoji':
                await _emoji(client, interaction);
                break;
        }
    })
);

async function _enable(client: BotClient, interaction: CommandInteraction) {
    const channel = interaction.options.getChannel('channel', true) as GuildChannel;

    if (channel.type !== 'GUILD_TEXT') {
        return await interaction.reply('Invalid Channel');
    }

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            starboardEnabled: true,
            starboardChannel: channel.id
        }
    });

    return await interaction.reply(`Enabled starboard in ${channel}`);

}

async function _disable(client: BotClient, interaction: CommandInteraction) {
    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            starboardEnabled: false,
            starboardChannel: null
        }
    });

    return await interaction.reply('Disabled starboard');
}

async function _minimum(client: BotClient, interaction: CommandInteraction) {
    const min = interaction.options.getInteger('min', true);

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            starboardMin: min
        }
    });

    return await interaction.reply(`Set the minimum number of reactions to ${min}`);
}

async function _emoji(client: BotClient, interaction: CommandInteraction) {
    const emoji = interaction.options.getString('emoji', true);

    await client.prisma.guildConfig.update({
        where: {gid: interaction.guildId!},
        data: {
            starboardEmoji: emoji
        }
    });

    return await interaction.reply(`Set the emote to ${emoji}`);
}
