import {ButtonHandler} from '@src/lib/util/ButtonHandler';
import {BotClient} from '@src/lib/BotClient';
import {ButtonInteraction, Message, MessageEmbed} from 'discord.js';
import {ServerSuggestion} from '@src/lib/interfaces/ServerSuggestion';

export default new ButtonHandler('serverSuggestion:*', (async (client, interaction) => {
    const id = interaction.customId;

    const split = id.split(':');
    const sid = split[1];
    const action = split[2] as 'upvote' | 'downvote';

    const data: ServerSuggestion = {
        sid: parseInt(sid),
        gid: interaction.guildId!,
        uid: interaction.user.id
    };

    if (action === 'downvote') {
        await _downvote(client, interaction, data);
    } else {
        await _upvote(client, interaction, data);
    }

}));

const _upvote = async (client: BotClient, interaction: ButtonInteraction, data: ServerSuggestion) => {
    const {upvotes, downvotes, content, uid} = await client.prisma.serverSuggestions.update({
        where: {
            sid: data.sid
        },
        data: {
            upvotes: {
                increment: 1
            }
        },
        select: {
            upvotes: true,
            content: true,
            downvotes: true,
            uid: true
        }
    });

    const user = await client.users.fetch(uid);

    const newEmbed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setDescription(content)
        .addField('Upvotes', `${upvotes}`, true)
        .addField('Downvotes', `${downvotes}`, true);

    await (interaction.message as Message).edit({
        embeds: [newEmbed]
    });

    await interaction.reply({
        content: 'Your vote was recorded',
        ephemeral: true
    });

};

const _downvote = async (client: BotClient, interaction: ButtonInteraction, data: ServerSuggestion) => {
    const {upvotes, downvotes, content, uid, sid} = await client.prisma.serverSuggestions.update({
        where: {
            sid: data.sid
        },
        data: {
            downvotes: {
                increment: 1
            }
        },
        select: {
            upvotes: true,
            content: true,
            downvotes: true,
            uid: true,
            sid: true
        }
    });

    const user = await client.users.fetch(uid);

    const newEmbed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .setDescription(content)
        .addField('Upvotes', `${upvotes}`, true)
        .addField('Downvotes', `${downvotes}`, true)
        .setFooter(`Suggestion ID: ${sid}`);


    await (interaction.message as Message).edit({
        embeds: [newEmbed]
    });

    await interaction.reply({
        content: 'Your vote was recorded',
        ephemeral: true
    });
};

