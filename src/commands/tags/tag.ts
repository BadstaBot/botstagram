import {SlashCommand} from '@src/lib/util/SlashCommand';
import {CommandInteraction, MessageEmbed} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';
import {Tags} from '@prisma/client';


export default new SlashCommand(
    {
        name: 'tag',
        description: 'Show, create or manage tags',
        options: [
            {
                name: 'show',
                description: 'Show a tag',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'The tag name',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'create',
                description: 'Create a tag',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'The tag name',
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'content',
                        description: 'The tag content',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'manage',
                description: 'Manage a tag',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'name',
                        description: 'The tag name',
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },

    (async (client, interaction) => {
        const subCommand = interaction.options.getSubcommand(true) as 'show' | 'create' | 'manage';

        if (subCommand === 'show')
            await _show(client, interaction);
        else if (subCommand === 'create')
            await _create(client, interaction);
        else if (subCommand === 'manage')
            await _manage(client, interaction);
    })
);

const _show = async (client: BotClient, interaction: CommandInteraction) => {
    const tagName = interaction.options.getString('name', true);
    const tag = await _getTag(client, tagName, interaction.guildId!);
    if (!tag) {
        await interaction.reply({
            content: 'Unknown Tag',
            ephemeral: true
        });
        return;
    }
    const {createdAt, createdBy, title, content, tid, usageCount} = tag!;
    const author = await client.users.fetch(createdBy);

    const embed = new MessageEmbed()
        .setAuthor(author.tag, author.displayAvatarURL({dynamic: true}))
        .setTitle(title)
        .setTimestamp(createdAt)
        .setDescription(content)
        .setFooter(`This tag has been used ${usageCount} times.`);

    await interaction.reply({embeds: [embed]});

    await client.prisma.tags.update({
        where: {
            tid: tid
        },
        data: {
            usageCount: {
                increment: 1
            }
        }
    });
};

const _create = async (client: BotClient, interaction: CommandInteraction) => {
    const tagName = interaction.options.getString('name', true);
    const tagContent = interaction.options.getString('content', true);

    await client.prisma.tags.create({
        data: {
            gid: interaction.guildId!,
            title: tagName,
            content: tagContent,
            createdBy: interaction.user.id
        }
    });

    await interaction.reply(`Created tag ${tagName}`);
};

const _manage = async (client: BotClient, interaction: CommandInteraction) => {
    const tagName = interaction.options.getString('name', true);
    const tag = await _getTag(client, tagName, interaction.guildId!);
    if (!tag) {
        await interaction.reply({
            content: 'Unknown Tag',
            ephemeral: true
        });
        return;
    }
};

const _getTag = async (client: BotClient, tagName: string, guildId: string): Promise<Tags | null> => {
    const tag = await client.prisma.tags.findFirst({
        where: {
            gid: guildId,
            title: tagName
        }
    });

    return tag;
};
