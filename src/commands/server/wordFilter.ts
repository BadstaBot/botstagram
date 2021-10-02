import {SlashCommand} from '@src/lib/util/SlashCommand';
import {BotClient} from '@src/lib/BotClient';
import {CommandInteraction, MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'wordfilter',
        description: 'Manage the word filter',
        options: [
            {
                name: 'add',
                description: 'Add a word to the filter',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'word',
                        description: 'The word',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove a word from the filter',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'word',
                        description: 'The word',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'enable',
                description: 'Enable the filter',
                type: 'SUB_COMMAND'
            },
            {
                name: 'disable',
                description: 'Disable the filter',
                type: 'SUB_COMMAND'
            },
            {
                name: 'view',
                description: 'Show all the blocked words',
                type: 'SUB_COMMAND'
            }
        ]
    },

    (async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand(true);

        switch (subCommand) {
            case 'add':
                await _add(client, interaction);
                break;
            case 'remove':
                await _remove(client, interaction);
                break;
            case 'disable':
                await _disable(client, interaction);
                break;
            case 'enable':
                await _enable(client, interaction);
                break;
            case 'view':
                await _view(client, interaction);
                break;
        }
    })
);

async function _add(client: BotClient, interaction: CommandInteraction) {
    const word = interaction.options.getString('word', true);
    await client.prisma.guildConfig.update({
        where: {
            gid: interaction.guildId!
        },
        data: {
            wordFilter: {
                push: word
            }
        }
    });

    await interaction.reply({
        content: `Added ${word}.`,
        ephemeral: true
    });
}

async function _remove(client: BotClient, interaction: CommandInteraction) {
    const word = interaction.options.getString('word', true);

    const filter = (await client.prisma.guildConfig.findFirst({
        where: {
            gid: interaction.guildId!
        }
    }))!.wordFilter;

    const index = filter.indexOf(word);

    delete filter[index];

    await client.prisma.guildConfig.update({
        where: {
            gid: interaction.guildId!
        },
        data: {
            wordFilter: filter
        }
    });

    await interaction.reply({
        content: `Added ${word}.`,
        ephemeral: true
    });
}

async function _disable(client: BotClient, interaction: CommandInteraction) {
    await client.prisma.guildConfig.update({
        where: {
            gid: interaction.guildId!
        },
        data: {
            wordFilterEnabled: false
        }
    });

    await interaction.reply('Disabled the word filter');
}

async function _enable(client: BotClient, interaction: CommandInteraction) {
    await client.prisma.guildConfig.update({
        where: {
            gid: interaction.guildId!
        },
        data: {
            wordFilterEnabled: true
        }
    });

    await interaction.reply('Enabled the word filter');
}

async function _view(client: BotClient, interaction: CommandInteraction) {
    const filteredWords: string = (await client.prisma.guildConfig.findFirst({
        where: {
            gid: interaction.guildId!
        }
    }))!.wordFilter.join(', ');

    const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle('Word Filter')
        .setDescription(filteredWords);


    await interaction.reply({
        embeds: [embed]
    });
}
