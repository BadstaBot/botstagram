import {SlashCommand} from '@src/lib/util/SlashCommand';
import {MessageEmbed, Util} from 'discord.js';

export default new SlashCommand(
    {
        name: 'lyrics',
        description: 'Get lyrics for a song',
        options: [
            {
                name: 'song',
                description: 'The song',
                type: 'STRING',
                required: true
            }
        ]
    },

    (async (client, interaction) => {
        const song = interaction.options.getString('song', true);

        const tracks = await client.ksoft.lyrics.search(song, {
            limit: 1,
            textOnly: false
        });

        if (!tracks.length) {
            await interaction.reply({
                content: 'Could not find the lyrics for that song',
                ephemeral: true
            });
        }

        const track = tracks[0];

        const lyrics = Util.splitMessage(track.lyrics, {
            maxLength: 2048,
            char: ' '
        });


        if (lyrics.length === 1) {
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(lyrics[0])
                ],
            });
            return;
        }

        const embeds: MessageEmbed[] = [];

        for (const lyricPage of lyrics) {
            embeds.push(
                new MessageEmbed().setDescription(lyricPage)
            );
        }

        await client.util.paginate(interaction, embeds);

    })
);
