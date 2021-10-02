import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed} from 'discord.js';

export default new SlashCommand(
    {
        name: 'meme',
        description: 'Get a meme',
    },

    async (client, interaction) => {
        const meme = await client.ksoft.images.meme();
        const {post} = meme;

        const embed = new MessageEmbed()
            .setTitle(post.title)
            .setURL(post.link)
            .setImage(meme.url)
            .setDescription([
                `**Upvotes** ${post.upvotes}`,
                `**Downvotes** ${post.downvotes}`
            ].join('\n'))
            .setFooter(`Posted in ${post.subreddit} by ${post.author}`);

        await interaction.reply({embeds: [embed]});
    }
);
