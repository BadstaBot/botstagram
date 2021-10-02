import {Event} from '@src/lib/util/Event';
import {BotClient} from '@src/lib/BotClient';
import {Message, MessageActionRow, MessageButton, MessageEmbed, MessageReaction, TextChannel, User} from 'discord.js';

export default new Event('messageReactionAdd', async (client, reaction, user) => {

    await _handleStarboard(client, await reaction.fetch(), user as User);
});

async function _handleStarboard(client: BotClient, reaction: MessageReaction, user: User) {
    if (user.id === reaction.message.author!.id) return; // no self star for u lol


    const cfg = (await client.prisma.guildConfig.findFirst({
        where: {
            gid: reaction.message.guild!.id
        }
    }))!;
    const channelId = cfg.starboardChannel;

    if (!channelId) return;

    const channel = reaction.message.guild?.channels!.resolve(channelId);

    const emoji = cfg.starboardEmoji;
    if (reaction.emoji.name !== emoji) return;

    const min = cfg.starboardMin;

    const reactions = reaction.message.reactions.cache.filter((reaction) => reaction.emoji.name === emoji).first();

    if (reactions!.count < min) return;

    const message = reaction.message as Message;

    const embed = new MessageEmbed()
        .setColor('NOT_QUITE_BLACK')
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
        .setDescription(`
        ${message.channel}
        
        ${message.content}
        `);


    await (channel as TextChannel).send({
        content: `${emoji} ${reactions!.count}`,
        embeds: [embed],
        components: [
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setURL(message.url)
                    .setEmoji('↖️')
                    .setLabel('Jump to message')
                    .setStyle('LINK')
            ])
        ]
    });
}
