import {SlashCommand} from '@src/lib/util/SlashCommand';
import {BotClient} from '@src/lib/BotClient';
import {CommandInteraction, MessageEmbed} from 'discord.js';
import {stripIndents} from 'common-tags';

export default new SlashCommand(
    {
        userPerms: 'MANAGE_GUILD',
        name: 'config',
        description: 'View or set the server config',
        requiresBot: true,
        options: [
            {
                name: 'view',
                description: 'View the server config',
                type: 'SUB_COMMAND'
            },
            {
                name: 'set',
                description: 'Change a config option',
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: 'mod_log',
                        description: 'Set the mod log',
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'channel',
                                description: 'The new channel (leave unset to reset)',
                                type: 'CHANNEL'
                            }
                        ]
                    },
                    {
                        name: 'punish_log',
                        description: 'Set the punish log',
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'channel',
                                description: 'The new channel (leave unset to reset)',
                                type: 'CHANNEL'
                            }
                        ]
                    },
                    {
                        name: 'hide_mods',
                        description: 'Set whether the moderator should be hidden from punish messages',
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'hide_mods',
                                description: 'The new setting',
                                type: 'BOOLEAN',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'report_channel',
                        description: 'Set the channel user reports are posted in',
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'channel',
                                description: 'The new channel (leave unset to reset)',
                                type: 'BOOLEAN',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'suggestion_channel',
                        description: 'Set the channel server suggestions are posted in',
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'channel',
                                description: 'The new channel (leave unset to reset)',
                                type: 'CHANNEL',
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    },


    (async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const subcommandGroup = interaction.options.getSubcommandGroup(false);

        if (subcommand === 'view') {
            await view(client, interaction);
        } else if (subcommandGroup) {
            await set(client, interaction);
        }
    })
);


async function view(client: BotClient, interaction: CommandInteraction) {
    const cfg = await client.prisma.guildConfig.findFirst({
        where: {
            gid: interaction.guildId!
        }
    })!;


    const modLog = interaction.guild!.channels.resolve(cfg!.modlog as string);
    const punishLog = interaction.guild!.channels.resolve(cfg!.punishlog as string);
    const reportChannel = interaction.guild!.channels.resolve(cfg!.reportchannel as string);
    const suggestChannel = interaction.guild!.channels.resolve(cfg!.suggestChannel as string);
    const hideMods = cfg!.hideMod;
    const massMentionThreshold = cfg!.massMentionThreshold;

    const embed = new MessageEmbed()
        .setTitle('Server Configuration')
        .setDescription(stripIndents`
        Mod Log: ${modLog || 'None'}
        Punish Log: ${punishLog || 'None'}
        Report Channel: ${reportChannel || 'None'}
        Hide Mods: ${hideMods ? 'Yes' : 'No'}
        
        Mass Mention Enabled: ${cfg!.massMentionEnabled}
        Mass Mention Threshold: ${massMentionThreshold}
        Mass Mention Action: ${cfg!.massMentionAction}
        
        Suggest Channel: ${suggestChannel || 'None'}
        `);

    await interaction.reply({embeds: [embed]});
}

async function set(client: BotClient, interaction: CommandInteraction) {
    const options = await interaction.options;
    const subcommand = options.getSubcommand();

    const channel = options.getChannel('channel', false) || null;

    let description = 'If you see this, something broke... here\'s a cookie 🍪';

    switch (subcommand) {
        case 'mod_log':
            await client.prisma.guildConfig.update({
                where: {
                    gid: interaction.guildId!
                },
                data: {
                    modlog: channel?.id || null
                }
            });
            description = `The mod log channel has been ${!channel ? 'reset' : `set to ${channel}`}`;
            break;

        case 'punish_log':
            await client.prisma.guildConfig.update({
                where: {
                    gid: interaction.guildId!
                },
                data: {
                    punishlog: channel?.id || null
                }
            });
            description = `The punish log channel has been ${!channel ? 'reset' : `set to ${channel}`}`;
            break;

        case 'report_channel':
            await client.prisma.guildConfig.update({
                where: {
                    gid: interaction.guildId!
                },
                data: {
                    reportchannel: channel?.id || null
                }
            });
            description = `The report channel has been ${!channel ? 'reset' : `set to ${channel}`}`;
            break;

        case 'hide_mods': {
            await client.prisma.guildConfig.update({
                where: {
                    gid: interaction.guildId!
                },
                data: {
                    hideMod: interaction.options.getBoolean('hide_mods', true)
                }
            });
            description = `Hide mods has been ${interaction.options.getBoolean('hide_mods', true) ? 'en' : 'dis'}abled`;
        }
        break;

        case 'suggestion_channel':
            await client.prisma.guildConfig.update({
                where: {
                    gid: interaction.guildId!
                },
                data: {
                    suggestChannel: channel?.id || null
                }
            });
            description = `The suggestion channel has been ${!channel ? 'reset' : `set to ${channel}`}`;
            break;
    }

    await interaction.reply({
        embeds: [new MessageEmbed().setDescription(description)]
    });
}
