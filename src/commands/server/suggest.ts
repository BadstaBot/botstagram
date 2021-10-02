import {SlashCommand} from '@src/lib/util/SlashCommand';
import {CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel} from 'discord.js';
import {BotClient} from '@src/lib/BotClient';


export default new SlashCommand(
    {
        name: 'suggest',
        description: 'Suggest something',
        options: [
            {
                name: 'create',
                description: 'Create a suggestion',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'suggestion',
                        description: 'The suggestion',
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'deny',
                description: 'Mark a suggestion as denied',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'suggestion_id',
                        description: 'The suggestion ID',
                        type: 'INTEGER',
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason',
                        type: 'STRING',
                        required: false
                    }
                ]
            },
            {
                name: 'approve',
                description: 'Mark a suggestion as approved',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'suggestion_id',
                        description: 'The suggestion ID',
                        type: 'INTEGER',
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason',
                        type: 'STRING',
                        required: false
                    }
                ]
            },
            {
                name: 'consider',
                description: 'Mark a suggestion as consider',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'suggestion_id',
                        description: 'The suggestion ID',
                        type: 'INTEGER',
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason',
                        type: 'STRING',
                        required: false
                    }
                ]
            },
        ]
    },

    (async (client, interaction) => {

    })
);

const _create = async (client: BotClient, interaction: CommandInteraction) => {
    const suggestChannelId = (await client.prisma.guildConfig.findFirst({
        where: {
            gid: interaction.guildId!
        }
    }))!.suggestChannel;

    if (!suggestChannelId) {
        await interaction.reply('The suggestion channel is not set.');
        return;
    }

    const suggestChannel = interaction.guild!.channels.resolve(suggestChannelId) as TextChannel;

    if (!suggestChannel) {
        return;
    }

    const suggestion = interaction.options.getString('suggestion', true);

    const {sid} = await client.prisma.serverSuggestions.create({
        data: {
            gid: interaction.guildId!,
            uid: interaction.user.id,
            content: suggestion
        },
        select: {
            sid: true
        }
    });

    const embed = new MessageEmbed()
        .setTitle('Suggestion')
        .setDescription(suggestion)
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({dynamic: true}))
        .addField('Upvotes', '0', true)
        .addField('Downvotes', '0', true)
        .setFooter(`Suggestion ID: ${sid}`);

    const buttons = [
        new MessageButton()
            .setStyle('PRIMARY')
            .setEmoji('⬆️')
            .setCustomId(`serverSuggestion:${sid}:upvote`),
        new MessageButton()
            .setStyle('DANGER')
            .setEmoji('⬇️')
            .setCustomId(`serverSuggestion:${sid}:downvote`)
    ];


    const msg = await suggestChannel.send({
        embeds: [embed],
        components: [new MessageActionRow().addComponents(buttons)]
    });

    await interaction.reply({
        content: 'Your suggestion has been posted.',
        ephemeral: true
    });

    await client.prisma.serverSuggestions.update({
        where: {
            sid: sid
        },
        data: {
            mid: msg.id
        }
    });
};

const _deny = async (client: BotClient, interaction: CommandInteraction) => {
    const sid = interaction.options.getInteger('suggestion_id', true);
    const reason = interaction.options.getString('reason', false) ?? 'No reason given';

    const channelId = (await client.prisma.guildConfig.findFirst({
        where: {
            gid: interaction.guildId!
        }
    }))!.suggestChannel!;

    const {mid, uid, content, upvotes, downvotes} = await client.prisma.serverSuggestions.update({
        where: {
            sid: sid
        },
        data: {
            status: 'Denied',
            reason: reason
        },
        select: {
            mid: true,
            uid: true,
            content: true,
            upvotes: true,
            downvotes: true,
        }
    });

    const channel = await interaction.guild!.channels.fetch(channelId).catch(() => {
        return null;
    });

    if (!channel) {
        await interaction.reply({
            content: 'Couldn\'t mark suggestion as denied. Unknown suggestion channel (was it deleted?)',
            ephemeral: true
        });
        return;
    }

    const msg = (channel as TextChannel).messages.fetch(mid!).catch(() => {
        return null;
    });

    if (!msg) {
        await interaction.reply({
            content: 'Couldn\'t mark suggestion as denied. Unknown suggestion message (was it deleted?)',
            ephemeral: true
        });
        return;
    }

    await interaction.reply({
        content: 'Suggestion denied',
        ephemeral: true
    });

    const user = await client.users.fetch(uid);

    const newEmbed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setDescription(content)
        .addField('Upvotes', `${upvotes}`, true)
        .addField('Downvotes', `${downvotes}`, true)
        .addField(`Denied by ${interaction.user.tag}`, reason, false);
};

const _approve = async (client: BotClient, interaction: CommandInteraction) => {

};

const _consider = async (client: BotClient, interaction: CommandInteraction) => {

};
